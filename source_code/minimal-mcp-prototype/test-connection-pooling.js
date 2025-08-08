#!/usr/bin/env node

// Test script for connection pooling implementation
// This script tests the MCP server with connection pooling enabled

const http = require('http');
const { performance } = require('perf_hooks');

// Configuration
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const TEST_USERNAME = process.env.TEST_USERNAME || 'erikashby';
const TEST_KEY = process.env.TEST_KEY || 'your-test-key'; // Replace with actual key
const NUM_REQUESTS = parseInt(process.env.NUM_REQUESTS) || 10;
const CONCURRENT_REQUESTS = parseInt(process.env.CONCURRENT_REQUESTS) || 3;

console.log('🧪 Connection Pooling Test Script');
console.log(`Server: ${SERVER_URL}`);
console.log(`User: ${TEST_USERNAME}`);
console.log(`Requests: ${NUM_REQUESTS}, Concurrent: ${CONCURRENT_REQUESTS}`);
console.log('');

// Test MCP request
async function makeMCPRequest(requestId) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      id: requestId,
      method: 'tools/list'
    });

    const options = {
      hostname: new URL(SERVER_URL).hostname,
      port: new URL(SERVER_URL).port || 80,
      path: `/mcp/${TEST_USERNAME}/${TEST_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 30000 // 30 second timeout
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        try {
          const response = JSON.parse(data);
          resolve({
            requestId,
            duration: Math.round(duration),
            status: res.statusCode,
            success: res.statusCode === 200,
            hasTools: response.result?.tools?.length > 0,
            error: response.error || null,
            responseSize: data.length
          });
        } catch (parseError) {
          resolve({
            requestId,
            duration: Math.round(duration),
            status: res.statusCode,
            success: false,
            error: `Parse error: ${parseError.message}`,
            rawResponse: data.substring(0, 200)
          });
        }
      });
    });

    req.on('error', (error) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      resolve({
        requestId,
        duration: Math.round(duration),
        success: false,
        error: error.message,
        status: 0
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      resolve({
        requestId,
        duration: Math.round(duration),
        success: false,
        error: 'Request timeout',
        status: 0
      });
    });

    req.write(postData);
    req.end();
  });
}

// Get pool statistics
async function getPoolStats() {
  return new Promise((resolve) => {
    const options = {
      hostname: new URL(SERVER_URL).hostname,
      port: new URL(SERVER_URL).port || 80,
      path: '/pool/stats',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          resolve({ error: 'Failed to parse stats' });
        }
      });
    });

    req.on('error', () => resolve({ error: 'Failed to get stats' }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'Stats request timeout' });
    });

    req.end();
  });
}

// Run concurrent requests
async function runConcurrentTest(batchSize, batchNum) {
  console.log(`📦 Batch ${batchNum}: Running ${batchSize} concurrent requests...`);
  
  const promises = [];
  for (let i = 0; i < batchSize; i++) {
    const requestId = `batch${batchNum}_req${i + 1}`;
    promises.push(makeMCPRequest(requestId));
  }
  
  const results = await Promise.all(promises);
  
  // Analyze results
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const minDuration = Math.min(...results.map(r => r.duration));
  const maxDuration = Math.max(...results.map(r => r.duration));
  
  console.log(`   ✅ Success: ${successful}/${results.length} (${Math.round(successful/results.length*100)}%)`);
  console.log(`   ⚡ Timing: ${Math.round(avgDuration)}ms avg (${minDuration}-${maxDuration}ms)`);
  
  if (failed > 0) {
    console.log(`   ❌ Failures:`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`      ${r.requestId}: ${r.error} (${r.duration}ms)`);
    });
  }
  
  return results;
}

// Main test function
async function runTest() {
  console.log('🚀 Starting connection pooling test...\n');
  
  // Check initial pool stats
  console.log('📊 Initial pool stats:');
  const initialStats = await getPoolStats();
  console.log(JSON.stringify(initialStats, null, 2));
  console.log('');
  
  if (!initialStats.enabled) {
    console.log('⚠️  Warning: Connection pooling is not enabled!');
    console.log('   Set CONNECTION_POOLING_ENABLED=true to test pooling');
    console.log('');
  }
  
  const allResults = [];
  const startTime = performance.now();
  
  // Run batches of concurrent requests
  const numBatches = Math.ceil(NUM_REQUESTS / CONCURRENT_REQUESTS);
  
  for (let batch = 0; batch < numBatches; batch++) {
    const batchSize = Math.min(CONCURRENT_REQUESTS, NUM_REQUESTS - (batch * CONCURRENT_REQUESTS));
    if (batchSize <= 0) break;
    
    const batchResults = await runConcurrentTest(batchSize, batch + 1);
    allResults.push(...batchResults);
    
    // Small delay between batches to see pooling effect
    if (batch < numBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  const totalTime = performance.now() - startTime;
  
  console.log('\n📈 Final Results:');
  
  // Overall statistics
  const totalSuccessful = allResults.filter(r => r.success).length;
  const totalFailed = allResults.length - totalSuccessful;
  const overallAvgDuration = allResults.reduce((sum, r) => sum + r.duration, 0) / allResults.length;
  const overallMinDuration = Math.min(...allResults.map(r => r.duration));
  const overallMaxDuration = Math.max(...allResults.map(r => r.duration));
  
  console.log(`   Total Requests: ${allResults.length}`);
  console.log(`   Success Rate: ${totalSuccessful}/${allResults.length} (${Math.round(totalSuccessful/allResults.length*100)}%)`);
  console.log(`   Average Duration: ${Math.round(overallAvgDuration)}ms`);
  console.log(`   Duration Range: ${overallMinDuration}ms - ${overallMaxDuration}ms`);
  console.log(`   Total Test Time: ${Math.round(totalTime)}ms`);
  console.log(`   Requests/Second: ${Math.round(allResults.length / (totalTime/1000))}`);
  
  // Check final pool stats
  console.log('\n📊 Final pool stats:');
  const finalStats = await getPoolStats();
  console.log(JSON.stringify(finalStats, null, 2));
  
  // Connection pooling effectiveness analysis
  if (initialStats.enabled && finalStats.enabled) {
    console.log('\n🎯 Connection Pooling Analysis:');
    const connectionsCreated = finalStats.created - (initialStats.created || 0);
    const connectionsReused = finalStats.reused - (initialStats.reused || 0);
    const poolingEfficiency = connectionsReused > 0 ? Math.round((connectionsReused / (connectionsCreated + connectionsReused)) * 100) : 0;
    
    console.log(`   Connections Created: ${connectionsCreated}`);
    console.log(`   Connections Reused: ${connectionsReused}`);
    console.log(`   Pooling Efficiency: ${poolingEfficiency}% (higher is better)`);
    console.log(`   Active Connections: ${finalStats.activeConnections}`);
    
    if (finalStats.connectionDetails && finalStats.connectionDetails.length > 0) {
      console.log(`   Connection Details:`);
      finalStats.connectionDetails.forEach(conn => {
        console.log(`      ${conn.username}: ${conn.requests} requests, ${Math.round(conn.age/1000)}s old`);
      });
    }
  }
  
  // Performance expectations
  console.log('\n🎯 Performance Analysis:');
  if (finalStats.enabled) {
    // With pooling, subsequent requests should be much faster
    const firstRequest = allResults[0];
    const laterRequests = allResults.slice(1);
    const laterAvgDuration = laterRequests.reduce((sum, r) => sum + r.duration, 0) / laterRequests.length;
    
    console.log(`   First Request: ${firstRequest.duration}ms (includes connection setup)`);
    console.log(`   Later Requests: ${Math.round(laterAvgDuration)}ms avg (should be much faster with pooling)`);
    console.log(`   Performance Improvement: ${Math.round((firstRequest.duration - laterAvgDuration) / firstRequest.duration * 100)}%`);
    
    if (laterAvgDuration < firstRequest.duration * 0.5) {
      console.log(`   ✅ Connection pooling appears to be working effectively!`);
    } else {
      console.log(`   ⚠️  Connection pooling benefit is minimal - check implementation`);
    }
  } else {
    if (overallAvgDuration > 1000) {
      console.log(`   ⚠️  Average duration ${Math.round(overallAvgDuration)}ms is high - connection pooling would help`);
    } else {
      console.log(`   ✅ Performance is acceptable without pooling`);
    }
  }
  
  if (totalFailed > 0) {
    console.log(`\n❌ ${totalFailed} requests failed - investigate errors above`);
    process.exit(1);
  } else {
    console.log(`\n✅ All requests successful! Connection pooling implementation working correctly.`);
    process.exit(0);
  }
}

// Run the test
runTest().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});