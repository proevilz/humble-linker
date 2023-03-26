import { useEffect, useState } from 'react'
import humbleLogo from './assets/logo.svg'

interface TwitchAuth {
    channelId: string
    clientId: string
    userId: string
    helixToken: string
    token: string
}

interface Config {
    id: string
    name: string
    url: string
}
function App() {
    const [twitchAuth, setTwitchAuth] = useState<TwitchAuth | null>(null)
    const [gameName, setGameName] = useState<string | null>(null)
    const [config, setConfig] = useState<Config[] | null>(null)
    const [storeUrl, setStoreUrl] = useState<string>('#')
    const [gameImage, setGameImage] = useState<string>('')
    useEffect(() => {
        window.Twitch.ext.onAuthorized(function (auth: TwitchAuth) {
            setTwitchAuth(auth)
        })
        window.Twitch.ext.configuration.onChanged(() => {
            const configuration =
                window.Twitch.ext.configuration.broadcaster?.content
            if (configuration) {
                setConfig(JSON.parse(configuration))
            }
        })
    }, [])

    const getGame = async () => {
        if (!twitchAuth) return
        const request = await fetch(
            `https://api.twitch.tv/helix/channels?broadcaster_id=${twitchAuth.channelId}`,
            {
                headers: {
                    'client-id': twitchAuth.clientId,
                    Authorization: `Extension ${twitchAuth.helixToken}`,
                },
            }
        )
        if (!request.ok) return
        const response = await request.json()
        setGameName(response.data[0].game_name)
        const match = config?.find(
            (game) =>
                game.name.toLowerCase() ===
                response.data[0].game_name.toLowerCase()
        )
        console.log({ match })
        if (match) {
            setStoreUrl(match.url)
        }
    }
    useEffect(() => {
        if (!twitchAuth) return
        getGame()
    }, [twitchAuth])

    //fetch request to get a webpages og:image
    useEffect(() => {
        if (!storeUrl) return

        const getGameImage = async () => {
            console.log(storeUrl)
            const request = await fetch(storeUrl)
            if (!request.ok) return
            const response = await request.text()
            const parser = new DOMParser()
            const doc = parser.parseFromString(response, 'text/html')
            const image = doc.querySelector('meta[property="og:image"]')
            console.log(doc)
            if (image) {
                setGameImage(image.getAttribute('content') || '')
            }
        }
        getGameImage()
    }, [storeUrl])

    return (
        <div className='bg-white h-screen p-4'>
            <header className='flex justify-center'>
                <img
                    src={humbleLogo}
                    alt='logo'
                    className='w-[140px]'
                    onClick={getGame}
                />
            </header>
            <main>
                <div className='text-center py-3'>
                    <h3>
                        Like the game I'm currently playing? It's a game called{' '}
                        <br />
                        <span className={`font-bold`}>{gameName}</span>
                    </h3>
                    <h4>Click below to get it from the Humble Store!</h4>
                </div>
                <a href={storeUrl} target='_blank'>
                    <div className='rounded overflow-hidden w-30'>
                        <img
                            src={gameImage ?? 'https://via.placeholder.com/300'}
                            alt='humble bundle game cover'
                        />
                    </div>
                </a>
            </main>
        </div>
    )
}

export default App
