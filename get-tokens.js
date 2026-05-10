/**
 * get-tokens.js — Lance ce script UNE SEULE FOIS depuis ton terminal
 * pour obtenir tes tokens WHOOP à coller dans Vercel.
 *
 * Usage :
 *   node get-tokens.js
 */
 
require('dotenv').config({ path: '.env.local' })
const http  = require('http')
const url   = require('url')
 
const CLIENT_ID     = process.env.WHOOP_CLIENT_ID
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET
const REDIRECT_URI  = 'http://localhost:3000/callback'
 
const AUTH_URL  = 'https://api.prod.whoop.com/oauth/oauth2/auth'
const TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token'
 
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Ajoute WHOOP_CLIENT_ID et WHOOP_CLIENT_SECRET dans .env.local')
  process.exit(1)
}
 
const authUrl = `${AUTH_URL}?${new URLSearchParams({
  client_id:     CLIENT_ID,
  redirect_uri:  REDIRECT_URI,
  response_type: 'code',
  scope:         'read:recovery read:sleep read:workout read:cycles read:profile offline',
})}`
 
console.log('\n╔══════════════════════════════════╗')
console.log('║  Iris — Générateur de tokens      ║')
console.log('╚══════════════════════════════════╝\n')
console.log('1. Ouvre cette URL dans ton navigateur :\n')
console.log(`   ${authUrl}\n`)
console.log('2. Connecte-toi avec ton compte WHOOP')
console.log('3. Autorise Vitae')
console.log('4. Tu seras redirigé — les tokens apparaîtront ici\n')
 
const server = http.createServer(async (req, res) => {
  const { pathname, query } = url.parse(req.url, true)
  if (pathname !== '/callback') return
 
  const code = query.code
  if (!code) {
    res.end('Pas de code reçu.')
    return
  }
 
  try {
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri:  REDIRECT_URI,
      }),
    })
 
    const tokens = await tokenRes.json()
 
    console.log('✅ TOKENS RÉCUPÉRÉS\n')
    console.log('Copie ces 2 variables dans Vercel → Settings → Environment Variables :\n')
    console.log(`WHOOP_ACCESS_TOKEN=${tokens.access_token}`)
    console.log(`WHOOP_REFRESH_TOKEN=${tokens.refresh_token}\n`)
    console.log('(Expire dans', Math.round(tokens.expires_in / 3600), 'h — refresh automatique ensuite)\n')
 
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(`<html><body style="font-family:system-ui;padding:40px;background:#0C1828;color:#F0EDE6">
      <h2 style="color:#F5C842">✅ Tokens récupérés !</h2>
      <p>Regarde ton terminal pour les tokens à coller dans Vercel.</p>
      <p style="color:#9A9488">Tu peux fermer cette fenêtre.</p>
    </body></html>`)
 
    setTimeout(() => { server.close(); process.exit(0) }, 500)
 
  } catch (err) {
    console.error('Erreur :', err.message)
    res.end('Erreur — voir le terminal.')
  }
})
 
server.listen(3000, () => {
  console.log('En attente du callback sur localhost:3000...\n')
})
