export default async function handler(req, res) {
  const { code } = req.query;
  
  console.log('Simple Google callback accessed with code:', code ? 'present' : 'missing');
  
  // For now, just return a success response
  res.status(200).json({ 
    message: 'Simple Google callback route is working',
    hasCode: !!code,
    timestamp: new Date().toISOString(),
    note: 'This is a simplified version for testing deployment'
  });
} 