const fs = require('fs');
const path = require('path');

function resolveConflicts(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const result = [];
  let state = 'normal'; // 'normal', 'head', 'other'

  for (const line of lines) {
    const bare = line.replace(/\r$/, '');
    if (/^<<<<<<< /.test(bare)) {
      state = 'head';
    } else if (bare === '=======' && (state === 'head' || state === 'normal')) {
      // Could be orphaned separator (HEAD marker already removed) - treat as start of 'other'
      state = 'other';
    } else if (/^>>>>>>> /.test(bare) && state === 'other') {
      state = 'normal';
    } else if (state === 'normal' || state === 'head') {
      result.push(line);
    }
    // state === 'other': skip lines
  }

  fs.writeFileSync(filePath, result.join('\n'), 'utf8');
  console.log('Fixed:', filePath);
}

const files = [
  'src/pages/admin/Drives.tsx',
  'src/pages/admin/Reports.tsx',
  'src/pages/admin/Settings.tsx',
  'src/pages/admin/Students.tsx',
  'src/pages/student/Dashboard.tsx',
  'src/pages/student/Opportunities.tsx',
  'src/pages/student/Profile.tsx',
];

for (const f of files) {
  resolveConflicts(path.join(__dirname, f));
}

console.log('All conflicts resolved!');
