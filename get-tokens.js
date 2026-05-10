cat > get-tokens.js << 'EOF'
require('dotenv').config({ path: '.env.local' })
const http = require('http')
const url  = require('url')

const CLIENT_ID     = process.env.WHOOP_CLIENT_ID
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET
const REDIRECT_URI  = 'http://localhost:3000/callback'
const STATE         = 'vitae12345678'

const AUTH_URL  = 'https://api.prod.whoop.com/oauth/oauth2/auth'
const TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token'

const authUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=read:recovery+read:sleep+read:workout+read:cycles+read:profile+offline&state=${STATE}`

console.log('\n╔══════════════════════════════════╗')
console.log('║  Iris — Générateur de tokens     ║')
console.log('╚══════════════════════════════════╝\n')
console.log('Ouvre cette URL dans Chrome :\n')
console.log(authUrl + '\n')
console.log('En attente du callback...\n')

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true)
  if (parsed.pathname !== '/callback') return

  const { code, error, state } = parsed.query

  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/html' })
    res.end(`<h2>Erreur: ${error}</h2>`)
    return
  }

  if (state !== STATE) {
    res.writeHead(400, { 'Content-Type': 'text/html' })
    res.end('<h2>Erreur: state invalide</h2>')
    return
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    })

    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })

    const tokens = await tokenRes.json()
    console.log('\n✅ TOKENS RÉCUPÉRÉS\n')
    console.log('WHOOP_ACCESS_TOKEN=' + tokens.access_token)
    console.log('WHOOP_REFRESH_TOKEN=' + tokens.refresh_token)
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<h2 style="font-family:sans-serif;color:green">✅ Tokens récupérés ! Regarde le terminal.</h2>')
    setTimeout(() => { server.close(); process.exit(0) }, 1000)
  } catch (err) {
    console.error('Erreur:', err.message)
    res.end('Erreur: ' + err.message)
  }
})

server.listen(3000, () => console.log('Serveur démarré sur localhost:3000'))
EOF
