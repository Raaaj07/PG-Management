import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  console.log('DNS resolver overridden. Current servers:', dns.getServers());
} catch (err) {
  console.warn('Could not override DNS servers:', err.message);
}
