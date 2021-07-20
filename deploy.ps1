push-location
set-location "src/cake-lambda-blog"

dotnet publish
pop-location
set-location pulumi
pulumi up
pop-location
