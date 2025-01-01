import net from 'net'
import readline from 'readline'
import { checkForUpdate } from './Update.mjs'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

// Funkcja do łączenia się z serwerem
const connectToServer = (address, port) => {
    return new Promise((resolve, reject) => {
        const con = net.createConnection(port, address, () => {
            resolve(con)
        })

        con.on('error', (err) => {
            reject(err)
        })
    })
}

const sendMessage = (con) => {
    rl.question('', (message) => {
        if (message.toLowerCase() === 'exit') {
            console.log('Rozłączanie...')
            con.end()
            rl.close()
        } else {
            con.write(message)
            sendMessage(con)
        }
    })
}

const main = async () => {
    console.log("Denis Messenger")
    try {
        await checkForUpdate()
    } catch (error) {
        console.error(`[Aktualizacja] Błąd: ${error.message}`)
        rl.close()
        return
    }
    
    try {
        console.log("[Server] Łączę z serverem...")
        const con = await connectToServer('176.106.37.187', 8822)
        
        con.on('data', (data) => {
            const message = data.toString().trim()
            console.log(message)
        })
        
        con.on('end', () => {
            console.log('[Server] Połączenie zostało zakończone')
        })
        
        sendMessage(con)
    } catch (error) {
        console.error(`[Server] Błąd połączenia z serwerem: ${error.message}`)
        rl.close()
    }
}

main()
