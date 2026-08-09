
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSyncConfig = validateSyncConfig;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const yaml_1 = require("yaml");
const zod_1 = require("zod");
const syncSchema = zod_1.z.object({
    provider: zod_1.z.enum(['github', 'jira']),
    repo: zod_1.z.string().optional(), // For github
    project: zod_1.z.string().optional(), // For jira
    enabled: zod_1.z.boolean().default(true),
});
function validateSyncConfig(configPath) {
    const fullPath = node_path_1.default.resolve(configPath);
    if (!node_fs_1.default.existsSync(fullPath)) {
        throw new Error(`Sync config not found at ${fullPath}`);
    }
    const content = node_fs_1.default.readFileSync(fullPath, 'utf8');
    let parsed;
    try {
        parsed = (0, yaml_1.parse)(content);
    }
    catch (e) {
        throw new Error(`Invalid YAML format in ${configPath}: ${e}`);
    }
    return syncSchema.parse(parsed);
}
// If run directly
if (require.main === module) {
    try {
        const configPath = process.argv[2] || '.architecture-guard/sync.yml';
        const config = validateSyncConfig(configPath);
        console.log(JSON.stringify(config, null, 2));
        process.exit(0);
    }
    catch (e) {
        console.error(e instanceof Error ? e.message : e);
        process.exit(1);
    }
}
