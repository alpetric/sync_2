Import-Module WindmillClient
Connect-Windmill

# Set state
Set-WindmillState -Value @{foo = "bar"}
# Write-Output $Env.WM_STATE_PATH



# Get state
$state = Get-WindmillState

# Write-O$Env:WM_STATE_PATHutput "terst3"