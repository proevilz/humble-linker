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
function App({
    isPreview,
    panelText,
    boldGameName,
    imageUrl,
}: {
    isPreview: boolean
    panelText: string
    boldGameName: boolean
    imageUrl: string | null
}) {
    console.log('rendering app')
    const [twitchAuth, setTwitchAuth] = useState<TwitchAuth | null>(null)
    const [gameName, setGameName] = useState<string | null>(null)
    const [config, setConfig] = useState<Config[] | null>(null)
    const [storeUrl, setStoreUrl] = useState<string>('#')

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

    const parseText = (text: string) => {
        const name = boldGameName
            ? `<span class='font-bold'>${gameName}</span>`
            : gameName
        text = text.replace(/@gameName/g, name || '')
        text = text.replace(/@newLine/g, '<br />')

        return text
    }
    return (
        <div className={`bg-white p-4 ${!isPreview ? 'h-screen' : 'h-full'}`}>
            <header className='flex justify-center'>
                <img
                    src={humbleLogo}
                    alt='logo'
                    className='w-[140px]'
                    onClick={getGame}
                />
            </header>
            <main>
                {panelText.length !== 0 ? (
                    <div
                        className='text-center py-3'
                        dangerouslySetInnerHTML={{
                            __html: parseText(panelText),
                        }}
                    ></div>
                ) : (
                    <div className='text-center py-3'>
                        <h3>
                            Like the game I'm currently playing? It's a game
                            called <br />
                            <span className={`font-bold`}>{gameName}</span>
                        </h3>
                        <h4>Click below to get it from the Humble Store!</h4>s
                    </div>
                )}
                <a href={storeUrl} target='_blank'>
                    <div className='rounded overflow-hidden w-30'>
                        <img
                            src={
                                imageUrl ||
                                'https://hb.imgix.net/30a53f84a0ed9af7b3a9771113b48dfd9bd236e7.PNG?auto=compress,format&fit=crop&h=353&w=616&s=968530c9bf45ef19ed447a6e779c2c23'
                            }
                            alt='humble bundle game cover'
                        />
                    </div>
                </a>
            </main>
        </div>
    )
}

export default App
