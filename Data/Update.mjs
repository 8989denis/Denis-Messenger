import https from 'https'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { exec } from 'child_process'

// Funkcja do odczytania wersji z package.json
const getCurrentVersion = () => {
    const packageJsonPath = path.resolve('package.json')
    if (fs.existsSync(packageJsonPath)) {
        const data = fs.readFileSync(packageJsonPath, 'utf8')
        const packageJson = JSON.parse(data)
        return packageJson.version
    } else {
        throw new Error("Brak pliku package.json.")
    }
}

// Sprawdzenie aktualności wersji
export const checkForUpdate = () => {
    return new Promise((resolve, reject) => {
        // Wersja aplikacji pobrana z package.json
        const currentVersion = getCurrentVersion()
        console.log(`[Aktualizacja] Bieżąca wersja: ${currentVersion}`)
        if (!currentVersion) {
            return reject(new Error('Wersja aplikacji nie została określona.'))
        }

        https.get('https://github.com/8989denis/Denis-Messenger/releases/latest', {
            headers: { 'User-Agent': 'node.js' }
        }, (response) => {
            let data = ''
            response.on('data', chunk => data += chunk)
            response.on('end', () => {
                if (!data.trim()) {
                    return reject(new Error('Odpowiedź jest pusta lub niepoprawna.'))
                }

                try {
                    const latestVersion = JSON.parse(data).tag_name
                    if (latestVersion !== currentVersion) {
                        console.log(`[Aktualizacja] Wersja: ${currentVersion} (Przestarzała)`)
                        console.log(`[Aktualizacja] Nowa wersja dostępna: ${latestVersion} (Najnowsza).`)
                        console.log('[Aktualizacja] Rozpoczynam aktualizację...')
                        downloadUpdate(latestVersion)
                    } else {
                        console.log(`[Aktualizacja] Wersja: ${currentVersion} (Najnowsza)`)
                        resolve()
                    }
                } catch (err) {
                    return reject(new Error('Błąd parsowania JSON: ' + err.message))
                }
            })
        }).on('error', (err) => {
            return reject(new Error('Błąd podczas sprawdzania wersji: ' + err.message))
        })
    })
}

// Pobieranie najnowszej wersji aplikacji
const downloadUpdate = (version) => {
    const file = fs.createWriteStream(path.join(os.tmpdir(), 'Denis-Messenger.zip'))

    https.get(`https://github.com/8989denis/Denis-Messenger/releases/download/${version}/Denis-Messenger.zip`, (response) => {
        response.pipe(file)
        file.on('finish', () => {
            console.log('Plik pobrany. Rozpakowywanie...')
            extractUpdate(file.path)
        })
    }).on('error', (err) => {
        console.error('Błąd przy pobieraniu pliku:', err.message)
        throw new Error('Błąd przy pobieraniu pliku.')
    })
}

// Rozpakowywanie pobranego archiwum ZIP
const extractUpdate = (filePath) => {
    const unzipCommand = `unzip -o ${filePath} -d ./`
    exec(unzipCommand, (err, stdout, stderr) => {
        if (err) {
            console.error(`Błąd rozpakowywania: ${stderr}`)
            return
        }
        console.log(`[Aktualizacja] Pliki zostały rozpakowane: ${stdout}`)
        cleanUp(filePath)
    })
}

// Usuwanie pobranego pliku zip
const cleanUp = async (filePath) => {
    try {
        await fs.promises.unlink(filePath)
        console.log('[Aktualizacja] Pobrany plik ZIP został usunięty.')
        console.log('[Aktualizacja] Aktualizacja zakończona.')
    } catch (err) {
        console.error('Błąd przy usuwaniu pliku:', err.message)
    }
}
