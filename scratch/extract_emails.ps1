$csv = Import-Csv "C:\Users\v-apettit\Downloads\CircumSurvey Contacts - SECURE - Sheet2.csv"
$successEmails = $csv | Where-Object { $_.'Email Sent Status' -eq 'Success' } | ForEach-Object { $_.Email.Trim().ToLower() } | Sort-Object -Unique
Write-Host "Total unique successful emails: $($successEmails.Count)"
$successEmails | Out-File -Encoding utf8 "C:\Users\v-apettit\Downloads\circumsurvey_invite_list.txt"
Write-Host "---"
$successEmails
