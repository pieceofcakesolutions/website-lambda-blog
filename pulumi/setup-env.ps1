Param(
	[parameter(mandatory=$true)]
	$AccessKeyId,
	[parameter(mandatory=$true)]
	$SecretAccessKey
)
$env:AWS_ACCESS_KEY_ID = $AccessKeyId
$env:AWS_SECRET_ACCESS_KEY = $SecretAccessKey