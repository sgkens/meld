# RavenUI Task Tracker - Context Capsule Exporter Helper
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Invoke-ContextCapsuleHelper {
    Write-TrackerLog 'act' "Generating structured AI-ready workspace context capsule..." "Capsule"

    $repoRoot = Resolve-RepoPath "."
    $targetFile = [System.IO.Path]::Combine($repoRoot, "context-capsule.md")

    $sb = [System.Text.StringBuilder]::new()
    [void]$sb.AppendLine("# **RavenUI Workspace Context Capsule**")
    [void]$sb.AppendLine("Generated on: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))`n")

    # 1. Workspace Meta
    [void]$sb.AppendLine("## **1. Workspace Metadata**")
    $branch = (git branch --show-current 2>$null)
    if ($null -ne $branch) { $branch = $branch.Trim() } else { $branch = "unknown" }
    $commit = (git rev-parse HEAD 2>$null)
    if ($null -ne $commit) { $commit = $commit.Trim() } else { $commit = "unknown" }
    
    $version = "unknown"
    $resolvedVerFile = Resolve-RepoPath "VERSION"
    if ([System.IO.File]::Exists($resolvedVerFile)) {
        $version = ([System.IO.File]::ReadAllText($resolvedVerFile)).Trim()
    }

    [void]$sb.AppendLine("- **Active Branch:** ``$branch``")
    [void]$sb.AppendLine("- **Latest Commit:** ``$commit``")
    [void]$sb.AppendLine("- **Theme Version:** ``$version``")

    # Git status summary
    $gitStatus = git status --short 2>$null
    if ($gitStatus) {
        [void]$sb.AppendLine("- **Workspace Status:** Dirty (modified files below):")
        [void]$sb.AppendLine('```')
        foreach ($line in $gitStatus) {
            [void]$sb.AppendLine($line)
        }
        [void]$sb.AppendLine('```')
    } else {
        [void]$sb.AppendLine("- **Workspace Status:** Clean (no unstaged/staged modifications)")
    }
    [void]$sb.AppendLine("")

    # 2. Pending Tasks
    [void]$sb.AppendLine("## **2. Active Task List**")
    $pendingFile = Resolve-RepoPath "devtracker-pending.md"
    if ([System.IO.File]::Exists($pendingFile)) {
        $lines = [System.IO.File]::ReadAllLines($pendingFile)
        $inTasks = $false
        foreach ($line in $lines) {
            if ($line -match "^##\s+\*\*Tasklist\*\*") {
                $inTasks = $true
                continue
            }
            if ($inTasks) {
                [void]$sb.AppendLine($line)
            }
        }
    } else {
        [void]$sb.AppendLine("No active ``devtracker-pending.md`` file found.")
    }
    [void]$sb.AppendLine("")

    # 3. Component and Documentation Registry
    [void]$sb.AppendLine("## **3. Theme Components & Documentation**")
    [void]$sb.AppendLine("### **3.1. Reusable Components (`_includes/comps/`)**")
    $compsDir = Resolve-RepoPath "_includes/comps"
    if ([System.IO.Directory]::Exists($compsDir)) {
        $compFiles = [System.IO.Directory]::GetFiles($compsDir, "*.html")
        if ($compFiles.Count -gt 0) {
            foreach ($file in $compFiles) {
                $name = [System.IO.Path]::GetFileName($file)
                $size = (Get-Item $file).Length
                [void]$sb.AppendLine("- [``$name``](file://$($file -replace '\\', '/')) ($size bytes)")
            }
        } else {
            [void]$sb.AppendLine("- No HTML components found.")
        }
    } else {
        [void]$sb.AppendLine("- Component directory not found.")
    }
    [void]$sb.AppendLine("")

    [void]$sb.AppendLine("### **3.2. Documentation Pages (`docs/components/`)**")
    $docsCompsDir = Resolve-RepoPath "docs/components"
    if ([System.IO.Directory]::Exists($docsCompsDir)) {
        $docFiles = [System.IO.Directory]::GetFiles($docsCompsDir, "*.md")
        if ($docFiles.Count -gt 0) {
            foreach ($file in $docFiles) {
                $name = [System.IO.Path]::GetFileName($file)
                $size = (Get-Item $file).Length
                [void]$sb.AppendLine("- [``$name``](file://$($file -replace '\\', '/')) ($size bytes)")
            }
        } else {
            [void]$sb.AppendLine("- No markdown documentation files found.")
        }
    } else {
        [void]$sb.AppendLine("- Documentation directory not found.")
    }
    [void]$sb.AppendLine("")

    # 4. Engineering Context & Architecture Lessons Learned
    [void]$sb.AppendLine("## **4. Engineering Context & Architectural Guidelines**")
    $contextDir = Resolve-RepoPath "context-source"
    if ([System.IO.Directory]::Exists($contextDir)) {
        $contextFiles = [System.IO.Directory]::GetFiles($contextDir, "*.md")
        foreach ($file in $contextFiles) {
            $fileName = [System.IO.Path]::GetFileName($file)
            [void]$sb.AppendLine("### **4.1. Source: $fileName**")
            [void]$sb.AppendLine("> Reference: [source file](file://$($file -replace '\\', '/'))`n")
            $content = [System.IO.File]::ReadAllText($file)
            $content = $content -replace '^#\s+.*$', ''
            [void]$sb.AppendLine($content)
            [void]$sb.AppendLine("`n---`n")
        }
    } else {
        [void]$sb.AppendLine("No engineering context documents found.")
    }

    [System.IO.File]::WriteAllText($targetFile, $sb.ToString(), [System.Text.Encoding]::UTF8)
    Write-TrackerLog 'suc' "Structured context capsule generated at: $targetFile" "Capsule"
}

function Invoke-AgentContextHelper {
    param(
        [Parameter(Mandatory = $true)]
        [string]$TaskKey
    )

    Write-TrackerLog 'act' "Generating structured AI-ready task context capsule for TaskKey '$TaskKey'..." "Capsule"

    $repoRoot = Resolve-RepoPath "."
    $targetFile = [System.IO.Path]::Combine($repoRoot, "context-capsule.md")

    # 1. Parse devtracker-pending.md
    $pendingFile = Resolve-RepoPath "devtracker-pending.md"
    if (-not [System.IO.File]::Exists($pendingFile)) {
        Write-TrackerLog 'err' "Pending tasks file not found: $pendingFile" "Capsule"
        return
    }

    $parsed = Parse-TaskFile $pendingFile
    $matchedTask = $null
    $matchedCategory = ""

    foreach ($cat in $parsed.CategoryOrder) {
        foreach ($task in $parsed.TasksByCategory[$cat]) {
            # Check raw text or normalized text for TaskKey
            if ($task.RawText -match "\*\*$TaskKey\*\*" -or (Get-NormalizedTaskText $task.RawText).Contains($TaskKey.ToLower())) {
                $matchedTask = $task
                $matchedCategory = $cat
                break
            }
        }
        if ($matchedTask) { break }
    }

    if ($null -eq $matchedTask) {
        Write-TrackerLog 'err' "Task matching '$TaskKey' not found in $pendingFile" "Capsule"
        return
    }

    $sb = [System.Text.StringBuilder]::new()
    [void]$sb.AppendLine("# **Task Context Capsule: $TaskKey**")
    [void]$sb.AppendLine("Generated on: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))`n")

    [void]$sb.AppendLine("## **1. Task Brief**")
    $cleanCat = $matchedCategory -replace '^####?\s+\*\*|^\s*###\s+\*\*', '' -replace '\*\*.*$', ''
    [void]$sb.AppendLine("- **Category:** $cleanCat")
    [void]$sb.AppendLine("- **Task:** $($matchedTask.RawText.Trim())")
    
    # Extract scope/difficulty if possible
    $difficulty = "unknown"
    if ($matchedTask.RawText -match "🟢") { $difficulty = "very-easy" }
    elseif ($matchedTask.RawText -match "🟡") { $difficulty = "easy" }
    elseif ($matchedTask.RawText -match "🟠") { $difficulty = "moderate" }
    elseif ($matchedTask.RawText -match "🔴") { $difficulty = "very-hard" }
    
    $scope = "unknown"
    if ($matchedTask.RawText -match "🌟") { $scope = "feature" }
    elseif ($matchedTask.RawText -match "🦀") { $scope = "bug" }
    elseif ($matchedTask.RawText -match "🩹") { $scope = "fix" }
    elseif ($matchedTask.RawText -match "💡") { $scope = "concept" }
    
    [void]$sb.AppendLine("- **Difficulty:** $difficulty")
    [void]$sb.AppendLine("- **Scope:** $scope")
    [void]$sb.AppendLine("")

    if ($matchedTask.SubTasks -and $matchedTask.SubTasks.Count -gt 0) {
        [void]$sb.AppendLine("## **2. Subtasks**")
        foreach ($sub in $matchedTask.SubTasks) {
            [void]$sb.AppendLine("  $($sub.RawText.Trim())")
            foreach ($child in $sub.Children) {
                [void]$sb.AppendLine("  $child")
            }
        }
        [void]$sb.AppendLine("")
    }

    if ($matchedTask.Children -and $matchedTask.Children.Count -gt 0) {
        [void]$sb.AppendLine("## **3. Details & Notes**")
        foreach ($child in $matchedTask.Children) {
            [void]$sb.AppendLine($child)
        }
        [void]$sb.AppendLine("")
    }

    # 4. Extract and list referenced files
    [void]$sb.AppendLine("## **4. Relevant Files**")
    $filePaths = [System.Collections.Generic.HashSet[string]]::new()
    
    # Regex to find paths or links
    $pathPattern = '(?:file:///|/|[a-zA-Z]:\\)[^\s`''"()<>]+'
    $allText = $matchedTask.RawText + "`n" + ($matchedTask.Children -join "`n")
    if ($matchedTask.SubTasks) {
        foreach ($sub in $matchedTask.SubTasks) {
            $allText += "`n" + $sub.RawText + "`n" + ($sub.Children -join "`n")
        }
    }

    $matches = [Regex]::Matches($allText, $pathPattern)
    foreach ($m in $matches) {
        $path = $m.Value
        # Clean path from markdown link structures
        $path = $path -replace '[\)\]\*\#]', ''
        if ($path -match '^file:///(.*)$') {
            $path = $Matches[1]
        }
        if ($path) {
            $resolved = Resolve-RepoPath $path
            if ([System.IO.File]::Exists($resolved) -or [System.IO.Directory]::Exists($resolved)) {
                $filePaths.Add($path)
            }
        }
    }

    if ($filePaths.Count -gt 0) {
        foreach ($p in $filePaths) {
            [void]$sb.AppendLine("- [$p](file://$($p -replace '\\', '/'))")
        }
    } else {
        [void]$sb.AppendLine("No explicit file references found in the task notes.")
    }
    [void]$sb.AppendLine("")

    # 5. Relevant Rules & Architecture
    [void]$sb.AppendLine("## **5. Architectural Context**")
    $contextDir = Resolve-RepoPath "context-source"
    if ([System.IO.Directory]::Exists($contextDir)) {
        $contextFiles = [System.IO.Directory]::GetFiles($contextDir, "*.md")
        foreach ($file in $contextFiles) {
            $fileName = [System.IO.Path]::GetFileName($file)
            [void]$sb.AppendLine("### **5.1. Source: $fileName**")
            [void]$sb.AppendLine("> Reference: [source file](file://$($file -replace '\\', '/'))`n")
            $content = [System.IO.File]::ReadAllText($file)
            $content = $content -replace '^#\s+.*$', ''
            [void]$sb.AppendLine($content)
            [void]$sb.AppendLine("`n---`n")
        }
    } else {
        [void]$sb.AppendLine("No engineering context documents found.")
    }

    [System.IO.File]::WriteAllText($targetFile, $sb.ToString(), [System.Text.Encoding]::UTF8)
    Write-TrackerLog 'suc' "Structured context capsule for task '$TaskKey' generated at: $targetFile" "Capsule"
}
