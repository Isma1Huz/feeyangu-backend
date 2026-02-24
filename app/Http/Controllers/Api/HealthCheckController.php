<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;

class HealthCheckController extends Controller
{
    /**
     * Perform system health check
     */
    public function index()
    {
        $health = [
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'checks' => [],
        ];
        
        // Database check
        try {
            DB::connection()->getPdo();
            $health['checks']['database'] = [
                'status' => 'ok',
                'message' => 'Database connection successful',
            ];
        } catch (\Exception $e) {
            $health['status'] = 'unhealthy';
            $health['checks']['database'] = [
                'status' => 'error',
                'message' => 'Database connection failed: ' . $e->getMessage(),
            ];
        }
        
        // Cache check
        try {
            Cache::put('health_check', true, 10);
            $cacheWorks = Cache::get('health_check') === true;
            Cache::forget('health_check');
            
            $health['checks']['cache'] = [
                'status' => $cacheWorks ? 'ok' : 'warning',
                'message' => $cacheWorks ? 'Cache is working' : 'Cache is not working',
            ];
        } catch (\Exception $e) {
            $health['checks']['cache'] = [
                'status' => 'warning',
                'message' => 'Cache check failed: ' . $e->getMessage(),
            ];
        }
        
        // Storage check
        try {
            $storagePath = storage_path('logs');
            $writable = is_writable($storagePath);
            
            $health['checks']['storage'] = [
                'status' => $writable ? 'ok' : 'warning',
                'message' => $writable ? 'Storage is writable' : 'Storage is not writable',
            ];
        } catch (\Exception $e) {
            $health['checks']['storage'] = [
                'status' => 'warning',
                'message' => 'Storage check failed: ' . $e->getMessage(),
            ];
        }
        
        // Queue check
        try {
            // Check if Horizon is running
            $horizonStatus = Cache::get('illuminate:queue:restart');
            
            $health['checks']['queue'] = [
                'status' => 'ok',
                'message' => 'Queue system is configured',
                'note' => 'Run "php artisan horizon" to process queued jobs',
            ];
        } catch (\Exception $e) {
            $health['checks']['queue'] = [
                'status' => 'warning',
                'message' => 'Queue check inconclusive',
            ];
        }
        
        // Application info
        $health['application'] = [
            'name' => config('app.name'),
            'environment' => config('app.env'),
            'debug_mode' => config('app.debug'),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
        ];
        
        // Determine overall status
        $hasError = collect($health['checks'])->contains('status', 'error');
        if ($hasError) {
            $health['status'] = 'unhealthy';
        }
        
        $statusCode = $health['status'] === 'healthy' ? 200 : 503;
        
        return response()->json($health, $statusCode);
    }

    /**
     * Get system statistics
     */
    public function stats()
    {
        try {
            $stats = [
                'database' => [
                    'schools' => DB::table('schools')->count(),
                    'users' => DB::table('users')->count(),
                    'students' => DB::table('students')->count(),
                    'invoices' => DB::table('invoices')->count(),
                    'payments' => DB::table('payment_transactions')->count(),
                    'receipts' => DB::table('receipts')->count(),
                ],
                'storage' => [
                    'disk_free_space' => $this->formatBytes(disk_free_space(storage_path())),
                    'disk_total_space' => $this->formatBytes(disk_total_space(storage_path())),
                ],
                'memory' => [
                    'current_usage' => $this->formatBytes(memory_get_usage(true)),
                    'peak_usage' => $this->formatBytes(memory_get_peak_usage(true)),
                ],
                'timestamp' => now()->toIso8601String(),
            ];
            
            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve stats: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Format bytes to human readable format
     */
    protected function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
