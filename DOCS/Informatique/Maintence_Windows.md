
# MAINTENANCE WINDOWS
### OUVRIR LE POWERSHELL EN ADMINISTRATEUR

<#

Bilan de santé complet de l'ordinateur, un peu comme chez le médecin : création d’un point de restauration pour pouvoir revenir en arrière si besoin, vérification de la santé du disque et de la mémoire pour repérer une éventuelle panne à venir, réparation des fichiers système abîmés, installation des mises à jour Windows et des pilotes, puis nettoyage de fond (fichiers temporaires, caches des navigateurs, corbeille, raccourcis inutiles). L'ordinateur sera en général plus fluide et ramera moins, surtout au démarrage et à l’ouverture des programmes, mais si la machine est très ancienne ou manque de mémoire, le gain sera plus limité et la suite à envisager sera alors un ajout de mémoire ou un SSD. Les documents, photos, mots de passe, favoris, historique et logiciels ne sont pas touchés. Pensez simplement à enregistrer les onglets ou formulaires en cours car les navigateurs seront fermés automatiquement, et à vérifier que la corbeille ne contient rien d’utile car elle sera vidée. Durée d’environ une heure, avec un redémarrage du PC à la fin.

Maintenance Windows : nettoyage, réparation et diagnostic.
  - Matériel    : santé du disque, mémoire.
  - Logiciel    : mises à jour, nettoyage des fichiers.
  - Système     : réparation DISM/SFC, composants.
  - Utilisateur : caches navigateurs, corbeille, raccourcis.

Attention : l'étape 13 ferme les navigateurs, les étapes 14 et 16 demandent une confirmation.
Chaque étape peut aussi être lancée seule.
#>

# --- MAINTENANCE GLOBALE : NETTOYAGE, RÉPARATION & DIAGNOSTIC ---
```ps1
$EstAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $EstAdmin) {
    Write-Host "🔴 PowerShell n'est pas lancé en administrateur." -ForegroundColor Red
    Write-Host "   Ferme cette fenêtre, puis : Windows + R > powershell > Ctrl + Maj + Entrée." -ForegroundColor Red
    return
} else {
    ## Compteurs et mesures pour le rapport final (étape 21)
    $HeureDebut = Get-Date
    $NbFichiersSupp = 0
    $NbRegSupp = 0
    $EspaceAvant = (Get-PSDrive C).Used / 1GB

    Clear-Host

    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host "   MAINTENANCE GLOBALE : NETTOYAGE, RÉPARATION & DIAGNOSTIC" -ForegroundColor Cyan
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host "DÉBUT DES OPÉRATIONS : $($HeureDebut.ToString('HH:mm:ss'))" -ForegroundColor White
    Write-Host "ESPACE UTILISÉ SUR C: : $([math]::Round($EspaceAvant, 2)) Go" -ForegroundColor White
    Write-Host "MODE : TOUT-EN-UN | 21 ÉTAPES (1 À 21)" -ForegroundColor Magenta
    Write-Host "--------------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host "Ferme tes documents ouverts avant de continuer." -ForegroundColor Yellow
    Write-Host "--------------------------------------------------------------------" -ForegroundColor Cyan
}
```

# 1. SÉCURITÉ : Création d'un point de restauration

```ps1
Write-Progress -Activity "Maintenance" -Status "1/21 - Sécurité" -PercentComplete 0
Write-Host "[1/21] 🛡️ SÉCURITÉ : Création d'un point de restauration..." -ForegroundColor Cyan

## Active la protection système et lève la limite d'un point par 24 h
$CleRestore = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\SystemRestore"
Enable-ComputerRestore -Drive "C:\" -ErrorAction SilentlyContinue
Set-ItemProperty -Path $CleRestore -Name "SystemRestorePointCreationFrequency" -Value 0 -Type DWord -ErrorAction SilentlyContinue

Checkpoint-Computer -Description "AvantMaintenanceUltimate" -RestorePointType "MODIFY_SETTINGS" -ErrorAction SilentlyContinue

## Remet le comportement par défaut de Windows
Remove-ItemProperty -Path $CleRestore -Name "SystemRestorePointCreationFrequency" -ErrorAction SilentlyContinue

## Vérification : un point "AvantMaintenanceUltimate" créé il y a moins de 5 minutes ?
$PointOk = Get-ComputerRestorePoint -ErrorAction SilentlyContinue | Where-Object {
    $_.Description -eq "AvantMaintenanceUltimate" -and
    [Management.ManagementDateTimeConverter]::ToDateTime($_.CreationTime) -gt (Get-Date).AddMinutes(-5)
}

if ($PointOk) {
    Write-Host "🟢 Point de restauration créé avec succès." -ForegroundColor Green
} else {
    Write-Host "🔴 Échec : aucun point de restauration créé." -ForegroundColor Red
    $Rep = Read-Host "Continuer SANS point de restauration ? (O/N)"
    if ($Rep -notmatch "^[oOyY]") { return }
}
```

# 2. Optimisation Réseau et DNS

```ps1
Write-Progress -Activity "Maintenance" -Status "2/21" -PercentComplete 5
Write-Host "[2/21] 🟢 RÉSEAU : Optimisation TCP et Vidage DNS..." -ForegroundColor Yellow

$Echecs = @()
$NbIgnores = 0

## Reset IP : le code 1 est normal si seule une clé protégée refuse l'accès
$SortieIp = (netsh int ip reset 2>&1 | Out-String)
if ($LASTEXITCODE -ne 0) {
    $NbReussis = ([regex]::Matches($SortieIp, "réussie|succeeded", "IgnoreCase")).Count
    $NbRefus = ([regex]::Matches($SortieIp, "Accès refusé|Access is denied", "IgnoreCase")).Count
    if ($NbReussis -gt 0 -and $NbRefus -le 1) {
        $NbIgnores = $NbRefus   ## un seul refus sur une clé protégée : sans conséquence
    } else {
        $Echecs += "netsh int ip reset (code $LASTEXITCODE)"
    }
}

netsh winsock reset | Out-Null
if ($LASTEXITCODE -ne 0) { $Echecs += "netsh winsock reset (code $LASTEXITCODE)" }

ipconfig /flushdns | Out-Null
if ($LASTEXITCODE -ne 0) { $Echecs += "ipconfig /flushdns (code $LASTEXITCODE)" }

if ($Echecs.Count -eq 0) {
    Write-Host "🟢 Réseau réinitialisé et cache DNS vidé." -ForegroundColor Green
    if ($NbIgnores -gt 0) { Write-Host "   (1 clé protégée par Windows a refusé l'accès : normal, sans conséquence.)" -ForegroundColor DarkGray }
} else {
    Write-Host "🔴 Échec : $($Echecs -join ' ; ')" -ForegroundColor Red
}
Write-Host "🟠 Redémarrage du PC nécessaire pour finaliser cette étape." -ForegroundColor Yellow

```

# 3. Vérification physique du disque (S.M.A.R.T)
```ps1
Write-Progress -Activity "Maintenance" -Status "3/21" -PercentComplete 10
Write-Host "[3/21] 🟢 DISQUE : Analyse santé matérielle..." -ForegroundColor Yellow

$Problemes = @()

try {
    $Disques = Get-PhysicalDisk -ErrorAction Stop
    $Disques | Select-Object FriendlyName, MediaType, HealthStatus, OperationalStatus,
        @{N = "Taille (Go)"; E = { [math]::Round($_.Size / 1GB) }} | Format-Table -AutoSize

    foreach ($D in $Disques) {
        if ($D.HealthStatus -ne "Healthy") { $Problemes += "$($D.FriendlyName) : état $($D.HealthStatus)" }
        if ($D.OperationalStatus -ne "OK") { $Problemes += "$($D.FriendlyName) : statut $($D.OperationalStatus)" }
    }
}
catch {
    $Problemes += "Lecture des disques impossible : $($_.Exception.Message)"
}

## Prédiction de panne S.M.A.R.T (pas disponible sur tous les disques, notamment certains NVMe)
try {
    $Smart = Get-CimInstance -Namespace root\wmi -ClassName MSStorageDriver_FailurePredictStatus -ErrorAction Stop
    foreach ($S in $Smart) {
        if ($S.PredictFailure) { $Problemes += "S.M.A.R.T : panne prévue sur $($S.InstanceName)" }
    }
}
catch {
    Write-Host "   (Prédiction S.M.A.R.T non disponible sur ce matériel : ignorée.)" -ForegroundColor DarkGray
}

if ($Problemes.Count -eq 0) {
    Write-Host "🟢 Tous les disques sont en bonne santé." -ForegroundColor Green
} else {
    Write-Host "🔴 Problème détecté :" -ForegroundColor Red
    $Problemes | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
    Write-Host "   Sauvegarde tes données avant de continuer la maintenance." -ForegroundColor Red
}
```

# 4. Diagnostic de la mémoire (RAM)
```ps1
Write-Progress -Activity "Maintenance" -Status "4/21" -PercentComplete 15
Write-Host "[4/21] 🟢 MÉMOIRE : Analyse de l'utilisation de la RAM..." -ForegroundColor Yellow

try {
    $Os = Get-CimInstance Win32_OperatingSystem -ErrorAction Stop
    $TotalGo = [math]::Round($Os.TotalVisibleMemorySize / 1MB, 1)
    $LibreGo = [math]::Round($Os.FreePhysicalMemory / 1MB, 1)
    $UtiliseGo = [math]::Round($TotalGo - $LibreGo, 1)
    $Pourcent = [math]::Round(($UtiliseGo / $TotalGo) * 100)

    Write-Host "   RAM : $UtiliseGo Go utilisés sur $TotalGo Go ($Pourcent %), $LibreGo Go libres" -ForegroundColor White
    Write-Host ""
    Write-Host "   Top 5 des processus les plus gourmands :" -ForegroundColor White
    Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 5 Name, Id,
        @{N = "RAM (Mo)"; E = { [math]::Round($_.WorkingSet64 / 1MB) }} | Format-Table -AutoSize

    if ($Pourcent -lt 85) {
        Write-Host "🟢 Mémoire en bonne santé ($Pourcent % utilisés)." -ForegroundColor Green
    } elseif ($Pourcent -lt 95) {
        Write-Host "🟠 Mémoire très sollicitée ($Pourcent % utilisés). Ferme les applications du top 5 si tu n'en as pas besoin." -ForegroundColor Yellow
    } else {
        Write-Host "🔴 Mémoire presque saturée ($Pourcent % utilisés). Ferme des applications ou redémarre le PC." -ForegroundColor Red
    }
}
catch {
    Write-Host "🔴 Échec de la lecture de la mémoire : $($_.Exception.Message)" -ForegroundColor Red
}
```

# 5. Suppression des fichiers temporaires (avec comptage)
```ps1
Write-Progress -Activity "Maintenance" -Status "5/21" -PercentComplete 20
Write-Host "[5/21] 🟢 NETTOYAGE : Dossiers temporaires Windows..." -ForegroundColor Yellow

if ($null -eq $NbFichiersSupp) { $NbFichiersSupp = 0 }
$Avant = (Get-PSDrive C).Used / 1GB
$NbSupprimes = 0
$NbBloques = 0

foreach ($Path in @($env:TEMP, "C:\Windows\Temp")) {
    ## Tri inverse : on supprime les enfants avant les dossiers parents
    $Elements = Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue | Sort-Object FullName -Descending
    foreach ($E in $Elements) {
        try {
            Remove-Item -LiteralPath $E.FullName -Recurse -Force -ErrorAction Stop
            $NbSupprimes++
        }
        catch {
            if (Test-Path -LiteralPath $E.FullName) { $NbBloques++ }
        }
    }
}
$NbFichiersSupp += $NbSupprimes
$Gagne = [math]::Round($Avant - ((Get-PSDrive C).Used / 1GB), 2)

if ($NbBloques -eq 0) {
    Write-Host "🟢 $NbSupprimes éléments supprimés, $Gagne Go libérés." -ForegroundColor Green
} else {
    Write-Host "🟠 $NbSupprimes éléments supprimés, $Gagne Go libérés. $NbBloques éléments en cours d'utilisation ont été ignorés (normal)." -ForegroundColor Yellow
}
```

# 6. Nettoyage de l'historique des fichiers récents (Recent)
```ps1
Write-Progress -Activity "Maintenance" -Status "6/21" -PercentComplete 25
Write-Host "[6/21] 🟢 NETTOYAGE : Fichiers récents (Prefetch conservé)..." -ForegroundColor Yellow

if ($null -eq $NbFichiersSupp) { $NbFichiersSupp = 0 }
$Recent = Get-ChildItem "$env:APPDATA\Microsoft\Windows\Recent\*" -File -ErrorAction SilentlyContinue
$NbSupprimes = 0
foreach ($F in $Recent) {
    try { Remove-Item -LiteralPath $F.FullName -Force -ErrorAction Stop; $NbSupprimes++ } catch { }
}
$NbFichiersSupp += $NbSupprimes

Write-Host "🟢 $NbSupprimes raccourcis récents supprimés." -ForegroundColor Green
```
# 7. Réinitialisation du cache des icônes (Réparation visuelle)
```ps1
Write-Progress -Activity "Maintenance" -Status "7/21" -PercentComplete 30
Write-Host "[7/21] 🟢 SYSTÈME : Reset du cache des icônes..." -ForegroundColor Yellow

try {
    Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Remove-Item "$env:LOCALAPPDATA\IconCache.db" -Force -ErrorAction SilentlyContinue
    Remove-Item "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\iconcache*" -Force -ErrorAction SilentlyContinue
    Start-Process explorer
    Write-Host "🟢 Cache des icônes réinitialisé (l'explorateur a redémarré)." -ForegroundColor Green
}
catch {
    Start-Process explorer
    Write-Host "🔴 Échec : $($_.Exception.Message)" -ForegroundColor Red
}
```

# 8. Lancement du nettoyeur de disque automatique
```ps1
Write-Progress -Activity "Maintenance" -Status "8/21" -PercentComplete 35
Write-Host "[8/21] 🟢 DISQUE : Cleanmgr (Fichiers système)..." -ForegroundColor Yellow

$EstAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $EstAdmin) { Write-Host "🔴 Lance PowerShell en administrateur." -ForegroundColor Red; return }

try {
    ## Sans sageset préalable, /sagerun ne fait rien : on coche les catégories utiles
    $Base = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches"
    $Categories = "Temporary Files", "Temporary Setup Files", "Windows Update Cleanup", "Delivery Optimization Files", "Thumbnail Cache", "Windows Error Reporting Files", "Downloaded Program Files", "Old ChkDsk Files"
    foreach ($Nom in $Categories) {
        $Chemin = Join-Path $Base $Nom
        if (Test-Path $Chemin) { Set-ItemProperty -Path $Chemin -Name "StateFlags0001" -Value 2 -Type DWord }
    }
    $Avant = (Get-PSDrive C).Used / 1GB
    Start-Process cleanmgr -ArgumentList "/sagerun:1" -Wait -ErrorAction Stop
    $Gagne = [math]::Round($Avant - ((Get-PSDrive C).Used / 1GB), 2)
    Write-Host "🟢 Nettoyage de disque terminé ($Gagne Go libérés)." -ForegroundColor Green
}
catch {
    Write-Host "🔴 Échec : $($_.Exception.Message)" -ForegroundColor Red
}
```

# 9. Réparation de l'image système Windows (DISM)
```ps1
Write-Progress -Activity "Maintenance" -Status "9/21" -PercentComplete 40
Write-Host "[9/21] 🟢 RÉPARATION : DISM (Image système), 5 à 20 min..." -ForegroundColor Yellow

$EstAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $EstAdmin) { Write-Host "🔴 Lance PowerShell en administrateur." -ForegroundColor Red; return }

dism /online /cleanup-image /restorehealth | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "🟢 Image système réparée ou déjà saine." -ForegroundColor Green
} else {
    Write-Host "🔴 DISM a échoué (code $LASTEXITCODE). Détails : C:\Windows\Logs\DISM\dism.log" -ForegroundColor Red
}
```
# 10. Analyse et réparation des fichiers système (SFC)
```ps1
Write-Progress -Activity "Maintenance" -Status "10/21" -PercentComplete 50
Write-Host "[10/21] 🟢 RÉPARATION : SFC (Fichiers protégés), 5 à 15 min..." -ForegroundColor Yellow

$EstAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $EstAdmin) { Write-Host "🔴 Lance PowerShell en administrateur." -ForegroundColor Red; return }

sfc /scannow | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "🟢 Aucun fichier système corrompu, ou réparation réussie." -ForegroundColor Green
} else {
    Write-Host "🟠 SFC a signalé un problème (code $LASTEXITCODE). Relance l'étape 9 puis celle-ci. Détails : C:\Windows\Logs\CBS\CBS.log" -ForegroundColor Yellow
}
```

# 11. Recherche et installation des mises à jour et pilotes
```ps1
Write-Progress -Activity "Maintenance" -Status "11/21" -PercentComplete 60
Write-Host "[11/21] 🟢 UPDATE : Windows Update & Pilotes (peut être long)..." -ForegroundColor Yellow

$EstAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $EstAdmin) { Write-Host "🔴 Lance PowerShell en administrateur." -ForegroundColor Red; return }

try {
    if (-not (Get-Module -ListAvailable -Name PSWindowsUpdate)) {
        Install-PackageProvider -Name NuGet -Force -ErrorAction Stop | Out-Null
        Install-Module PSWindowsUpdate -Scope CurrentUser -Force -Confirm:$false -ErrorAction Stop
    }
    Import-Module PSWindowsUpdate -ErrorAction Stop
    $Maj = @(Get-WindowsUpdate -Install -AcceptAll -IgnoreReboot -MicrosoftUpdate -ErrorAction Stop)

    if ($Maj.Count -eq 0) {
        Write-Host "🟢 Windows est déjà à jour." -ForegroundColor Green
    } else {
        Write-Host "🟢 $($Maj.Count) mise(s) à jour traitée(s)." -ForegroundColor Green
    }
    if (Get-WURebootStatus -Silent) { Write-Host "🔄 Redémarrage du PC nécessaire pour finaliser les mises à jour." -ForegroundColor Yellow }
}
catch {
    Write-Host "🔴 Échec : $($_.Exception.Message)" -ForegroundColor Red
}
```

# 12. Nettoyage des résidus de mises à jour
```ps1
Write-Progress -Activity "Maintenance" -Status "12/21" -PercentComplete 65
Write-Host "[12/21] 🟢 SYSTÈME : Nettoyage dossier WinSxS..." -ForegroundColor Yellow

$EstAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $EstAdmin) { Write-Host "🔴 Lance PowerShell en administrateur." -ForegroundColor Red; return }

dism /online /Cleanup-Image /StartComponentCleanup | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "🟢 Composants obsolètes nettoyés." -ForegroundColor Green
} else {
    Write-Host "🔴 Échec (code $LASTEXITCODE). Si des mises à jour attendent un redémarrage, redémarre puis relance." -ForegroundColor Red
}
```

# 13. Nettoyage des caches navigateurs (sans toucher aux données personnelles) FERMETURE NAVIGATEUR!
```ps1
Write-Progress -Activity "Maintenance" -Status "13/21" -PercentComplete 70
Write-Host "[13/21] 🟢 WEB : Vidage des caches navigateurs..." -ForegroundColor Yellow

Stop-Process -Name "chrome", "msedge", "firefox" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$Avant = (Get-PSDrive C).Used / 1GB
$Dossiers = "Cache", "Code Cache", "GPUCache"
$Racines = @("$env:LOCALAPPDATA\Google\Chrome\User Data", "$env:LOCALAPPDATA\Microsoft\Edge\User Data")

foreach ($Racine in $Racines) {
    if (-not (Test-Path $Racine)) { continue }
    $Profils = Get-ChildItem -Path $Racine -Directory | Where-Object { $_.Name -eq "Default" -or $_.Name -like "Profile *" }
    foreach ($Profil in $Profils) {
        foreach ($Nom in $Dossiers) {
            $Cible = Join-Path $Profil.FullName $Nom
            if (Test-Path $Cible) { Remove-Item -Path "$Cible\*" -Recurse -Force -ErrorAction SilentlyContinue }
        }
    }
}
$Firefox = "$env:LOCALAPPDATA\Mozilla\Firefox\Profiles"
if (Test-Path $Firefox) {
    Get-ChildItem -Path $Firefox -Directory | ForEach-Object {
        $Cache = Join-Path $_.FullName "cache2"
        if (Test-Path $Cache) { Remove-Item -Path "$Cache\*" -Recurse -Force -ErrorAction SilentlyContinue }
    }
}
$Gagne = [math]::Round($Avant - ((Get-PSDrive C).Used / 1GB), 2)
Write-Host "🟢 Caches vidés ($Gagne Go libérés). Mots de passe, favoris et historique conservés." -ForegroundColor Green
```

# 14. Applications ouvertes (fermeture propre, avec confirmation)
```ps1

Write-Progress -Activity "Maintenance" -Status "14/21" -PercentComplete 75
Write-Host "[14/21] 🟢 APPS : Applications tierces ouvertes..." -ForegroundColor Yellow

$Exclus = "explorer|chrome|msedge|firefox|powershell|pwsh|WindowsTerminal|conhost|ApplicationFrameHost|TextInputHost|SystemSettings|ShellExperienceHost|StartMenuExperienceHost|SearchHost"
$Apps = @(Get-Process | Where-Object {
    $_.MainWindowTitle -ne "" -and $_.Id -ne $PID -and $_.Name -notmatch $Exclus -and $_.Company -notlike "*Microsoft*"
})

if ($Apps.Count -eq 0) {
    Write-Host "🟢 Aucune application tierce ouverte." -ForegroundColor Green
} else {
    $Apps | Select-Object Name, MainWindowTitle | Format-Table -AutoSize
    $Rep = Read-Host "Les fermer proprement (te demandera d'enregistrer si besoin) ? (O/N)"
    if ($Rep -match "^[oOyY]") {
        $Apps | ForEach-Object { [void]$_.CloseMainWindow() }
        Start-Sleep -Seconds 5
        $Restantes = @($Apps | Where-Object { -not $_.HasExited })
        if ($Restantes.Count -eq 0) {
            Write-Host "🟢 Toutes les applications ont été fermées." -ForegroundColor Green
        } else {
            Write-Host "🟠 Encore ouvertes (probablement une question d'enregistrement) : $($Restantes.Name -join ', ')" -ForegroundColor Yellow
        }
    } else {
        Write-Host "🟠 Aucune application fermée (choix de l'utilisateur)." -ForegroundColor Yellow
    }
}
```

# 15. Services tiers lancés au démarrage (lecture seule)
```ps1
Write-Progress -Activity "Maintenance" -Status "15/21" -PercentComplete 80
Write-Host "[15/21] 🟢 BOOT : Inventaire des services tiers automatiques..." -ForegroundColor Yellow

try {
    $Services = Get-CimInstance Win32_Service -ErrorAction Stop | Where-Object {
        $_.StartMode -eq "Auto" -and $_.PathName -notmatch "(?i)\\Windows\\|Microsoft"
    }
    $Services | Select-Object Name, DisplayName, State | Sort-Object DisplayName | Format-Table -AutoSize
    Write-Host "🟢 $(@($Services).Count) service(s) tiers automatique(s) listé(s). Aucune modification effectuée." -ForegroundColor Green
    Write-Host "   Pour en désactiver un : services.msc > clic droit > Propriétés > Type de démarrage." -ForegroundColor DarkGray
}
catch {
    Write-Host "🔴 Échec : $($_.Exception.Message)" -ForegroundColor Red
}
```

# 16. Désactivation des logiciels de démarrage (Run Keys), réversible
```ps1
Write-Progress -Activity "Maintenance" -Status "16/21" -PercentComplete 85
Write-Host "[16/21] 🟢 BOOT : Désactivation des programmes au démarrage..." -ForegroundColor Yellow

$EstAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $EstAdmin) { Write-Host "🔴 Lance PowerShell en administrateur." -ForegroundColor Red; return }
if ($null -eq $NbRegSupp) { $NbRegSupp = 0 }

## Sauvegarde des clés avant toute modification
$Bureau = [Environment]::GetFolderPath("Desktop")
reg export "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "$Bureau\sauvegarde-run.reg" /y | Out-Null
reg export "HKLM\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Run" "$Bureau\sauvegarde-run32.reg" /y | Out-Null

$Protege = "Security|Windows|Defender|Google|Realtek|NVIDIA|AMD|Intel|Synaptics|Audio|Bluetooth|Touchpad"
$Cibles = @(
    @{ Run = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run";             Approved = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run" },
    @{ Run = "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Run"; Approved = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run32" }
)

$ADesactiver = @()
foreach ($C in $Cibles) {
    if (-not (Test-Path $C.Run)) { continue }
    foreach ($Nom in (Get-Item $C.Run).Property) {
        if ($Nom -and $Nom -notmatch $Protege) { $ADesactiver += [pscustomobject]@{ Nom = $Nom; Run = $C.Run; Approved = $C.Approved } }
    }
}

if ($ADesactiver.Count -eq 0) {
    Write-Host "🟢 Rien à désactiver (seules des entrées système ou protégées existent)." -ForegroundColor Green
} else {
    $ADesactiver | Select-Object Nom | Format-Table -AutoSize
    $Rep = Read-Host "Désactiver ces $($ADesactiver.Count) entrée(s) au démarrage (réversible) ? (O/N)"
    if ($Rep -match "^[oOyY]") {
        $Off = [byte[]](3,0,0,0,0,0,0,0,0,0,0,0)
        foreach ($E in $ADesactiver) {
            if (-not (Test-Path $E.Approved)) { New-Item -Path $E.Approved -Force | Out-Null }
            Set-ItemProperty -Path $E.Approved -Name $E.Nom -Value $Off -Type Binary
            $NbRegSupp++
        }
        Write-Host "🟢 $($ADesactiver.Count) entrée(s) désactivée(s). Réactivables dans le Gestionnaire des tâches > Démarrage. Sauvegardes sur le Bureau." -ForegroundColor Green
    } else {
        Write-Host "🟠 Aucune modification (choix de l'utilisateur)." -ForegroundColor Yellow
    }
}
```

# 17. Nettoyage du Registre (traces MuiCache)
```ps1
Write-Progress -Activity "Maintenance" -Status "17/21" -PercentComplete 90
Write-Host "[17/21] 🟢 REGISTRE : Nettoyage des traces MuiCache..." -ForegroundColor Yellow

if ($null -eq $NbRegSupp) { $NbRegSupp = 0 }
$CleMui = "HKCU:\Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\MuiCache"

try {
    if (-not (Test-Path $CleMui)) {
        Write-Host "🟢 Clé MuiCache absente : rien à nettoyer." -ForegroundColor Green
    } else {
        ## Les entrées MuiCache sont des VALEURS de la clé, pas des sous-clés. LangID est conservée.
        $Valeurs = @((Get-Item $CleMui).Property | Where-Object { $_ -ne "LangID" })
        $NbSupprimes = 0
        foreach ($V in $Valeurs) {
            try { Remove-ItemProperty -Path $CleMui -Name $V -Force -ErrorAction Stop; $NbSupprimes++ } catch { }
        }
        $NbRegSupp += $NbSupprimes
        Write-Host "🟢 $NbSupprimes trace(s) MuiCache supprimée(s). Windows les recrée tout seul." -ForegroundColor Green
    }
}
catch {
    Write-Host "🔴 Échec : $($_.Exception.Message)" -ForegroundColor Red
}
```
# 18. Analyse du système de fichiers (chkdsk)
```ps1
Write-Progress -Activity "Maintenance" -Status "18/21" -PercentComplete 92
Write-Host "[18/21] 🟢 DISQUE : Analyse du système de fichiers (chkdsk /scan)..." -ForegroundColor Yellow

$EstAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $EstAdmin) { Write-Host "🔴 Lance PowerShell en administrateur." -ForegroundColor Red; return }

## /scan : analyse en ligne, sans verrouiller le disque ni redémarrer
chkdsk C: /scan | Out-Null
switch ($LASTEXITCODE) {
    0 { Write-Host "🟢 Aucune erreur détectée sur C:." -ForegroundColor Green }
    1 { Write-Host "🟠 Des erreurs ont été détectées et corrigées. Relance cette étape pour confirmer." -ForegroundColor Yellow }
    default {
        Write-Host "🔴 chkdsk a signalé un problème (code $LASTEXITCODE)." -ForegroundColor Red
        Write-Host "   Sauvegarde tes données, puis lance : chkdsk C: /spotfix (réparation au prochain redémarrage)." -ForegroundColor Red
    }
}
```

# 19. Optimisation du disque (TRIM pour SSD, défragmentation pour HDD)
```ps1
Write-Progress -Activity "Maintenance" -Status "19/21" -PercentComplete 95
Write-Host "[19/21] 🟢 DISQUE : Optimisation du lecteur C: (TRIM ou défragmentation)..." -ForegroundColor Yellow

$EstAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $EstAdmin) { Write-Host "🔴 Lance PowerShell en administrateur." -ForegroundColor Red; return }

try {
    ## Détection du type de disque qui héberge C:
    $Type = (Get-Partition -DriveLetter C -ErrorAction Stop | Get-Disk | Get-PhysicalDisk -ErrorAction Stop).MediaType

    switch ($Type) {
        "SSD" {
            Optimize-Volume -DriveLetter C -ReTrim -ErrorAction Stop | Out-Null
            Write-Host "🟢 SSD détecté : TRIM effectué." -ForegroundColor Green
        }
        "HDD" {
            Write-Host "   HDD détecté : défragmentation en cours, peut être long..." -ForegroundColor DarkGray
            Optimize-Volume -DriveLetter C -Defrag -ErrorAction Stop | Out-Null
            Write-Host "🟢 HDD détecté : défragmentation terminée." -ForegroundColor Green
        }
        default {
            Write-Host "🟠 Type de disque non reconnu ($Type) : optimisation ignorée par sécurité." -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "🔴 Échec : $($_.Exception.Message)" -ForegroundColor Red
}
```
# 20. Vidage final de la corbeille et raccourcis
```ps1
Write-Progress -Activity "Maintenance" -Status "20/21" -PercentComplete 98
Write-Host "[20/21] 🟢 DISQUE : Corbeille et raccourcis morts..." -ForegroundColor Yellow

if ($null -eq $NbFichiersSupp) { $NbFichiersSupp = 0 }
$Problemes = @()

## Corbeille : on compte d'abord, car Clear-RecycleBin peut échouer quand elle est déjà vide
try {
    $NbCorbeille = @((New-Object -ComObject Shell.Application).NameSpace(0xA).Items()).Count
    if ($NbCorbeille -gt 0) {
        Clear-RecycleBin -Force -ErrorAction Stop
        $NbFichiersSupp += $NbCorbeille
    }
}
catch { $Problemes += "Corbeille : $($_.Exception.Message)"; $NbCorbeille = 0 }

## Raccourcis morts du Bureau (utilisateur + Bureau public)
$Shell = New-Object -ComObject WScript.Shell
$NbRaccourcis = 0
$Bureaux = @("$env:USERPROFILE\Desktop", "$env:PUBLIC\Desktop")
foreach ($Bureau in $Bureaux) {
    Get-ChildItem "$Bureau\*.lnk" -ErrorAction SilentlyContinue | ForEach-Object {
        $Cible = $Shell.CreateShortcut($_.FullName).TargetPath
        if ($Cible -and -not (Test-Path -LiteralPath $Cible)) {
            try { Remove-Item -LiteralPath $_.FullName -Force -ErrorAction Stop; $NbRaccourcis++; $NbFichiersSupp++ }
            catch { $Problemes += "Raccourci : $($_.Name)" }
        }
    }
}

if ($Problemes.Count -eq 0) {
    Write-Host "🟢 Corbeille vidée ($NbCorbeille élément(s)), $NbRaccourcis raccourci(s) mort(s) supprimé(s)." -ForegroundColor Green
} else {
    Write-Host "🟠 Terminé avec avertissements :" -ForegroundColor Yellow
    $Problemes | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
}
```

# 21. Rapport final
```ps1
Write-Progress -Activity "Terminé" -Status "Prêt" -Completed

if ($null -eq $NbFichiersSupp) { $NbFichiersSupp = 0 }
if ($null -eq $NbRegSupp) { $NbRegSupp = 0 }
$HeureFin = Get-Date

## Ces deux valeurs n'existent que si le bloc d'initialisation a été lancé en début de maintenance
if ($HeureDebut) {
    $DureeFormat = "{0:hh\:mm\:ss}" -f ($HeureFin - $HeureDebut)
    $HeureDebutTxt = $HeureDebut.ToString('HH:mm:ss')
} else { $DureeFormat = "non mesurée"; $HeureDebutTxt = "non mesurée" }

if ($null -ne $EspaceAvant) {
    $EspaceGagneFormat = "{0:N2} Go" -f ($EspaceAvant - ((Get-PSDrive C).Used / 1GB))
} else { $EspaceGagneFormat = "non mesuré" }

Write-Host ""
Write-Host "================ RÉCAPITULATIF ================" -ForegroundColor Cyan
Write-Host " > ESPACE DISQUE LIBÉRÉ : $EspaceGagneFormat" -ForegroundColor Green
Write-Host " > ÉLÉMENTS NETTOYÉS    : $NbFichiersSupp" -ForegroundColor White
Write-Host " > ENTRÉES REGISTRE     : $NbRegSupp" -ForegroundColor White
Write-Host "-----------------------------------------------" -ForegroundColor Cyan
Write-Host " HEURE DE DÉBUT : $HeureDebutTxt"
Write-Host " HEURE DE FIN   : $($HeureFin.ToString('HH:mm:ss'))"
Write-Host " DURÉE TOTALE   : $DureeFormat" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔄 Maintenance terminée. Vérifie qu'aucune étape n'a affiché 🔴, puis redémarre le PC." -ForegroundColor White -BackgroundColor DarkGreen
```

# -----------------------------------
# Variante complète
- créer un `maintenance.txt` sur le bureau
- coller le contenu de ce fichier, sauf cette section
- enregistrer les modifications
- renommer l'extension `.txt` en `.ps1`
- lancer en PowerShell mode administrateur : `powershell -ExecutionPolicy Bypass -File "$([Environment]::GetFolderPath('Desktop'))\maintenance.ps1"`
