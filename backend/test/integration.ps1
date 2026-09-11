$ErrorActionPreference = 'Stop'
$baseUrl = if ($env:TEST_API_URL) { $env:TEST_API_URL } else { 'http://localhost:3000/api/v1' }
$password = 'Demo@123'

function Login([string]$email) {
  $body = @{ email = $email; password = $password } | ConvertTo-Json
  return (Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -ContentType 'application/json' -Body $body).data
}
function Headers($session) { return @{ Authorization = "Bearer $($session.accessToken)" } }
function Api([string]$method, [string]$path, $session, $body = $null) {
  $params = @{ Method = $method; Uri = "$baseUrl$path"; Headers = (Headers $session); ContentType = 'application/json' }
  if ($null -ne $body) { $params.Body = ($body | ConvertTo-Json -Depth 5) }
  return Invoke-RestMethod @params
}
function Status([string]$method, [string]$path, $session, $body = $null) {
  $params = @{ Method = $method; Uri = "$baseUrl$path"; Headers = (Headers $session); ContentType = 'application/json'; SkipHttpErrorCheck = $true }
  if ($null -ne $body) { $params.Body = ($body | ConvertTo-Json -Depth 5) }
  return (Invoke-WebRequest @params).StatusCode
}
function Assert-True([bool]$condition, [string]$message) { if (-not $condition) { throw $message } }

$super = Login 'superadmin@system.com'
$adminA = Login 'admin@company1.com'
$employeeA = Login 'employee@company1.com'
$adminB = Login 'admin@company2.com'
Assert-True ($super.user.role -eq 'SUPER_ADMIN') 'SUPER_ADMIN login failed'
Assert-True ($adminA.user.role -eq 'ADMIN') 'ADMIN login failed'
Assert-True ($employeeA.user.role -eq 'EMPLOYEE') 'EMPLOYEE login failed'

$companies = Api Get '/companies?page=1&pageSize=10' $super
Assert-True ($companies.meta.totalItems -ge 3) 'Company seed missing'
$qaCompany = (Api Post '/companies' $super @{ name='QA Company'; code="QA-$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"; email='qa@example.com'; phone='0901'; address='QA Street' }).data
$null = Api Patch "/companies/$($qaCompany.id)" $super @{ phone='0902' }
$null = Api Delete "/companies/$($qaCompany.id)" $super
Assert-True ((Api Get "/companies/$($qaCompany.id)" $super).data.status -eq 'INACTIVE') 'Company deactivate failed'

Assert-True ((Status Get '/companies' $adminA) -eq 403) 'ADMIN accessed companies'
Assert-True ((Status Get '/departments' $employeeA) -eq 403) 'EMPLOYEE accessed departments'
Assert-True ((Status Get '/positions' $employeeA) -eq 403) 'EMPLOYEE accessed positions'

$projectB = (Api Get '/projects?page=1&pageSize=10' $adminB).data[0]
Assert-True ((Status Get "/projects/$($projectB.id)" $adminA) -eq 404) 'Company A read Company B project'
$bulletinB = (Api Get '/bulletins?page=1&pageSize=10' $adminB).data[0]
Assert-True ((Status Patch "/bulletins/$($bulletinB.id)" $employeeA @{ title='Blocked cross-tenant edit' }) -eq 404) 'Company A changed Company B bulletin'

$department = (Api Post '/departments' $adminA @{ name='QA Department'; code="QA$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())" }).data
$position = (Api Post '/positions' $adminA @{ name='QA Engineer'; code="QP$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"; departmentId=$department.id }).data
$employee = (Api Post '/employees' $adminA @{ employeeCode="QA$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"; fullName='QA Employee'; email="qa$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())@example.com"; departmentId=$department.id; positionId=$position.id }).data
$meeting = (Api Post '/meetings' $employeeA @{ title='QA Meeting'; startAt=(Get-Date).AddDays(1).ToString('o'); endAt=(Get-Date).AddDays(1).AddHours(1).ToString('o') }).data
$project = (Api Post '/projects' $employeeA @{ name='QA Project'; code="QP$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())" }).data
$assigneeOptions = (Api Get '/employees/options/list' $employeeA).data
Assert-True ($assigneeOptions.Count -ge 1) 'EMPLOYEE could not load assignees'
$issue = (Api Post '/issues' $employeeA @{ projectId=$project.id; assigneeId=$employee.id; title='QA Issue'; priority='HIGH'; status='OPEN' }).data
Assert-True ($issue.assignee.id -eq $employee.id) 'Issue assignment failed'
$employeeBTarget = (Api Get '/employees/options/list' $adminB).data[0]
Assert-True ((Status Post '/issues' $adminA @{ projectId=$project.id; assigneeId=$employeeBTarget.id; title='Blocked cross-company assignment' }) -eq 400) 'Cross-company issue assignment was allowed'
$bulletin = (Api Post '/bulletins' $employeeA @{ title='QA Bulletin'; content='Integration test' }).data
$notification = (Api Post '/notifications' $employeeA @{ title='QA Notification'; message='Integration test' }).data
$null = Api Patch "/employees/$($employee.id)" $adminA @{ fullName='QA Employee Updated' }
$null = Api Patch "/meetings/$($meeting.id)" $employeeA @{ location='Online' }
$null = Api Patch "/projects/$($project.id)" $employeeA @{ status='ACTIVE' }
$null = Api Patch "/issues/$($issue.id)" $employeeA @{ status='DONE' }
$null = Api Patch "/issues/$($issue.id)" $adminA @{ priority='URGENT' }
$null = Api Patch "/bulletins/$($bulletin.id)" $employeeA @{ content='Updated' }
$null = Api Patch "/notifications/$($notification.id)" $employeeA @{ message='Updated' }
$null = Api Delete "/notifications/$($notification.id)" $employeeA
$null = Api Delete "/issues/$($issue.id)" $employeeA
$null = Api Delete "/bulletins/$($bulletin.id)" $employeeA
$null = Api Delete "/projects/$($project.id)" $employeeA
$null = Api Delete "/meetings/$($meeting.id)" $employeeA
$null = Api Delete "/employees/$($employee.id)" $adminA
$null = Api Delete "/positions/$($position.id)" $adminA
$null = Api Delete "/departments/$($department.id)" $adminA

[pscustomobject]@{
  Logins = 'SUPER_ADMIN, ADMIN, EMPLOYEE passed'
  CompanyCrud = 'passed'
  RoleGuard = 'passed'
  TenantIsolation = 'project read and bulletin update blocked'
  BusinessCrud = 'department, position, employee, project issue assignment, meeting, project, bulletin, notification passed'
}
