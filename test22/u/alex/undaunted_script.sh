# Create a dummy file
echo "Test data uploaded at $(date)" > /tmp/test_upload.txt
echo "This is a test file for S3 upload" >> /tmp/test_upload.txt
echo "Workspace: $WM_WORKSPACE" >> /tmp/test_upload.txt

# Generate a unique file key
FILE_KEY="test_upload_$(date +%s).txt"

echo "Uploading file with key: $FILE_KEY"

# Upload to S3 using Windmill's job helper endpoint
RESPONSE=$(curl -s -w "\n%{http_code}" \
  "$BASE_INTERNAL_URL/api/w/$WM_WORKSPACE/job_helpers/upload_s3_file?file_key=${FILE_KEY}" \
  --request POST \
  --header 'Content-Type: application/octet-stream' \
  --header 'Accept: application/json' \
  --header "Authorization: Bearer $WM_TOKEN" \
  --data-binary @/tmp/test_upload.txt)

# Extract HTTP status code and body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✓ File uploaded successfully!"
  # Return the file key for downstream scripts
  echo "$BODY"
else
  echo "✗ Upload failed"
  exit 1
fi
