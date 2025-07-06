# MCP HTTP Client Bridge for Claude Desktop
param(
    [string]$ServerUrl = "https://ai_context_service_private.railway.app/mcp"
)

$messageId = 0

function Send-MCPRequest {
    param(
        [string]$Method,
        [object]$Params = @{},
        [int]$Id
    )
    
    $body = @{
        jsonrpc = "2.0"
        id = $Id
        method = $Method
        params = $Params
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri $ServerUrl -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
        return $response
    }
    catch {
        throw "HTTP Request failed: $($_.Exception.Message)"
    }
}

# Process stdin messages from Claude Desktop
while ($true) {
    try {
        $line = [Console]::ReadLine()
        if ($null -eq $line) { break }
        
        if ($line.Trim()) {
            $message = $line | ConvertFrom-Json
            $global:messageId++
            
            try {
                $response = Send-MCPRequest -Method $message.method -Params $message.params -Id $message.id
                
                $jsonrpcResponse = @{
                    jsonrpc = "2.0"
                    id = $message.id
                    result = $response.result
                } | ConvertTo-Json -Depth 10 -Compress
                
                [Console]::WriteLine($jsonrpcResponse)
            }
            catch {
                $errorResponse = @{
                    jsonrpc = "2.0"
                    id = $message.id
                    error = @{
                        code = -32603
                        message = $_.Exception.Message
                    }
                } | ConvertTo-Json -Depth 10 -Compress
                
                [Console]::WriteLine($errorResponse)
            }
        }
    }
    catch {
        # Input parsing error
        break
    }
}

exit 0