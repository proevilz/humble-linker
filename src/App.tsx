import { useEffect, useState } from 'react'
import humbleLogo from './assets/logo.svg'
import { OpenExternal } from './components/OpenExternal'

interface TwitchAuth {
    channelId: string
    clientId: string
    userId: string
    helixToken: string
    token: string
}

interface Game {
    name: string
    url: string
    imageUrl: string
}
interface Config {
    boldGameName: boolean
    fallbackImageUrl: string | null
    panelText: string
    games: Game[]
}
function App({
    isPreview,
    panelText,
    boldGameName,
    imageUrl,
    gameName,
}: {
    isPreview?: boolean
    panelText?: string
    boldGameName?: boolean
    imageUrl?: string | null
    gameName?: string | null
}) {
    const [twitchAuth, setTwitchAuth] = useState<TwitchAuth | null>(null)
    const [config, setConfig] = useState<Config | null>(null)
    const [matchedGameIndex, setMatchedGameIndex] = useState<number | null>(
        null
    )
    const [theme, setTheme] = useState<'light' | 'dark'>('dark')
    useEffect(() => {
        window.Twitch.ext.onAuthorized(function (auth: TwitchAuth) {
            setTwitchAuth(auth)
        })
        window.Twitch.ext.onContext((context, _changed) => {
            if (context.theme) {
                setTheme(context.theme)
            }
        })
    }, [])
    window.Twitch.ext.configuration.onChanged(() => {
        const configuration =
            window.Twitch.ext.configuration.broadcaster?.content
        if (configuration) {
            setConfig(JSON.parse(configuration))
        }
    })

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

        const matchedGameIndex = config?.games.findIndex(
            (game) =>
                game.name.toLowerCase() ===
                response.data[0].game_name.toLowerCase()
        )

        if (matchedGameIndex !== -1) {
            setMatchedGameIndex(matchedGameIndex as number)
        }
    }
    useEffect(() => {
        if (!twitchAuth) return
        getGame()
    }, [twitchAuth])

    const getFromCurrentGameConfig = (
        key: 'gameName' | 'url' | 'imageUrl'
    ): string => {
        if (!key) return ''
        const defaultConfig = {
            gameName: '',
            url: 'https://www.humblebundle.com/store',
            imageUrl: 'humbleFallback.jpg',
        }
        if (matchedGameIndex === null || matchedGameIndex === -1) {
            return defaultConfig[key]
        }

        if (key === 'gameName') {
            return config?.games[matchedGameIndex]?.name ?? ''
        }
        if (key === 'url') {
            return config?.games[matchedGameIndex]?.url ?? ''
        }
        if (key === 'imageUrl') {
            return config?.games[matchedGameIndex]?.imageUrl ?? ''
        }
        return ''
    }
    const parseText = () => {
        let text =
            'Click the image below to open the Humble Bundle Store in a new tab!'
        if (panelText) {
            text = panelText
        } else if (
            matchedGameIndex !== null &&
            matchedGameIndex !== -1 &&
            config?.panelText
        ) {
            text = config.panelText
        }

        let name = ''

        if (isPreview) {
            name = boldGameName
                ? `<span class='font-bold'>${gameName ?? ''}</span>`
                : gameName || ''
        } else {
            name = config?.boldGameName
                ? `<span class='font-bold'>${getFromCurrentGameConfig(
                      'gameName'
                  )}</span>`
                : getFromCurrentGameConfig('gameName')
        }

        text = text.replace(/@gameName/g, name || '')
        text = text.replace(/@newLine/g, '<br />')

        return text
    }
    const storeUrl = getFromCurrentGameConfig('url')
    const gameImageUrl = isPreview
        ? imageUrl
        : getFromCurrentGameConfig('imageUrl') ||
          config?.fallbackImageUrl ||
          'humbleFallback.jpg'

    const inDev = import.meta.env.MODE === 'development'
    return (
        <div
            className={`${
                theme === 'light' ? 'bg-white' : 'bg-[#201c2b]'
            } p-4 ${!isPreview ? 'h-screen' : 'h-full'}`}
        >
            <header className='flex justify-center'>
                <img
                    src={!inDev ? '.' + humbleLogo : humbleLogo}
                    alt='logo'
                    className='w-[140px]'
                    onClick={getGame}
                />
            </header>
            <main>
                <div
                    className={`text-center py-3 ${
                        theme === 'light' ? 'text-white' : 'text-[#e5e3e8]'
                    } `}
                    dangerouslySetInnerHTML={{
                        __html: parseText(),
                    }}
                ></div>

                <a
                    href={storeUrl ?? 'https://www.humblebundle.com/'}
                    target='_blank'
                >
                    <div className='rounded w-30 relative gameImageContainer '>
                        <img
                            className='drop-shadow-lg rounded mx-auto '
                            src={gameImageUrl!}
                            alt='humble bundle game cover'
                        />
                        <OpenExternal
                            width={100}
                            height={100}
                            className=' text-white opacity-0 absolute w-100 inset-0 mx-auto my-auto drop-shadow-lg transition-opacity duration-300'
                        />
                    </div>
                    <p className='text-[#e5e3e8] text-sm text-center mt-3'>
                        Note: The link might be an affiliate link
                    </p>
                </a>
            </main>
        </div>
    )
}

export default App
