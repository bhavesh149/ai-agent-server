# PM2 Configuration Fix for ES Modules

## Issue
When using `"type": "module"` in package.json, PM2 ecosystem config files need to use `.cjs` extension instead of `.js`.

## Solution
The ecosystem configuration has been renamed from `ecosystem.config.js` to `ecosystem.config.cjs`.

## Usage

### On EC2 Production Server:
```bash
# Set NODE_ENV for production
export NODE_ENV=production

# Start services
pm2 start ecosystem.config.cjs

# Save configuration
pm2 save
```

### For Local Development:
```bash
# Use development config (optional)
pm2 start ecosystem.dev.cjs

# Or use the smart config that auto-detects environment
pm2 start ecosystem.config.cjs
```

## Environment Detection
The main `ecosystem.config.cjs` now automatically detects:
- Operating system (Linux vs Windows)
- Environment (production vs development)
- Python interpreter (python3 vs python)
- Paths (EC2 vs local development)

## Files
- `ecosystem.config.cjs` - Smart configuration for all environments
- `ecosystem.dev.cjs` - Explicit development configuration
- All deployment scripts updated to use `.cjs` extension
