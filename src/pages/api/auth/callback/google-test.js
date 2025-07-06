export default async function handler(req, res) {
  const { code } = req.query;
  
  console.log('Test callback accessed with code:', code ? 'present' : 'missing');
  
  res.status(200).json({ 
    message: 'Google callback route is accessible',
    hasCode: !!code,
    timestamp: new Date().toISOString()
  });
} 