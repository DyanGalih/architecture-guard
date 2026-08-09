import fs from 'node:fs';
import path from 'node:path';

export function runArchive(changeName: string) {
    if (!changeName) {
        console.error('Error: change name is required');
        process.exit(1);
    }

    const changesDir = path.join(process.cwd(), 'openspec', 'changes');
    const sourceDir = path.join(changesDir, changeName);
    
    if (!fs.existsSync(sourceDir)) {
        console.error(`Error: source change directory not found: ${sourceDir}`);
        process.exit(1);
    }
    
    const date = new Date().toISOString().split('T')[0];
    const targetName = changeName.match(/^\d{4}-\d{2}-\d{2}-/) ? changeName : `${date}-${changeName}`;
    const archiveDir = path.join(changesDir, 'archive');
    const targetDir = path.join(archiveDir, targetName);
    
    if (fs.existsSync(targetDir)) {
        console.error(`Error: destination already exists: ${targetDir}`);
        process.exit(1);
    }
    
    fs.mkdirSync(archiveDir, { recursive: true });
    
    // Perform copy and explicit empty directory cleanup
    fs.cpSync(sourceDir, targetDir, { recursive: true });
    fs.rmSync(sourceDir, { recursive: true, force: true });
    
    console.log(`Successfully archived ${changeName} to ${targetDir}`);
}
