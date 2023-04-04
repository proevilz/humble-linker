import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import App from './App'
import CloseButton from './components/CloseButton'

const ConfigPage = () => {
    interface Game {
        name: string
        url: string
        id: string
        imageUrl: string
    }
    const regex =
        /^https?:\/\/(?:www\.)?humblebundle\.com(?:\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;=]*)?$/
    const imgRegex = /https?:\/\/(i\.imgur\.com|hb\.imgix\.net)\//i
    const [games, setGames] = useState<Game[]>([
        { id: uuidv4(), name: 'test', url: 'test', imageUrl: 'test' },
    ])
    const [error, setError] = useState<string | null>(null)
    const [saved, setSaved] = useState(false)
    const [panelText, setPanelText] = useState(
        " Like the game I'm currently playing? It's a game called @gameName"
    )
    const [previewGameIndex, setPreviewGameIndex] = useState(0)
    const [boldGameName, setBoldGameName] = useState(true)
    const [fallbackImageUrl, setFallbackImageUrl] = useState<string | null>(
        null
    )
    const addGame = () => {
        setGames([...games, { id: uuidv4(), name: '', url: '', imageUrl: '' }])
    }

    const isLastGame = (game: Game) => {
        return games.indexOf(game) === games.length - 1
    }
    const handleGameChange = (id: string, type: string, value: string) => {
        const updatedGames = games.map((game: Game) => {
            if (game.id === id) {
                return { ...game, [type]: value }
            }
            return game
        })
        setGames(updatedGames)
    }

    const removeGame = (id: string) => {
        const updatedGames = games.filter((game: Game) => game.id !== id)
        if (updatedGames.length !== 0) {
            setGames(updatedGames)
        }
    }

    const isFirstGame = (game: Game) => {
        return games.indexOf(game) === 0
    }
    const handleSave = async () => {
        setError(null)
        const isValid = (url: string) => regex.test(url) && url.length <= 100
        const isNameValid = (name: string) =>
            name.length > 0 && name.length <= 30
        const isGameValid = (game: Game) =>
            isValid(game.url) && isNameValid(game.name)
        const isValidImageUrl = (url: string) =>
            url.length === 0 ? true : imgRegex.test(url)
        if (
            games.every(isGameValid) &&
            games.every((game) => isValidImageUrl(game.imageUrl))
        ) {
            window.Twitch.ext.configuration.set(
                'broadcaster',
                '1.0',
                JSON.stringify({
                    games,
                    panelText,
                    boldGameName,
                    fallbackImageUrl: fallbackImageUrl,
                })
            )

            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
            return
        }

        setError(
            'Invalid game(s) detected. Please check your game and image urls and try again.'
        )
    }

    window.Twitch.ext.configuration.onChanged(() => {
        const config = window.Twitch.ext.configuration.broadcaster?.content
        if (config) {
            const { games, panelText, boldGameName, fallbackImageUrl } =
                JSON.parse(config)

            setGames(games)
            setPanelText(panelText)
            setBoldGameName(boldGameName)
            setFallbackImageUrl(fallbackImageUrl)
        }
    })
    const getGameImageUrl = () => {
        if (games[previewGameIndex].imageUrl) {
            return games[previewGameIndex].imageUrl
        }
        if (fallbackImageUrl) {
            return fallbackImageUrl
        }
        return 'humbleFallback.jpg'
    }
    return (
        <main className='flex flex-col px-4 mt-5 pb-5'>
            <h1 className='text-white font-bold text-2xl '>
                Configure games and links 🕹️
            </h1>
            <div className='mt-2 mb-10 bg-yellow-300 text-black p-2 rounded font-semibold'>
                <span className='font-bold'>Warning:</span> Only images hosted
                from <span className='text-red-500'>https://hb.imgix.net/</span>
                (humble bundle store images) and{' '}
                <span className='text-red-500'>https://i.imgur.com</span> will
                work. <br />
                This means your image URLs should start with either of those
                URLs else they will not load.
            </div>
            {games.map((game) => (
                <>
                    <div
                        key={game.id}
                        className='flex w-full items-center mb-4'
                    >
                        <div className='flex flex-col  grow '>
                            <label className='text-white'>
                                Game name (max 30 chars)
                            </label>
                            <input
                                id={`game-name-${game.id}`}
                                type='text'
                                className='rounded mt-1 px-1 py-2 mr-2 outline-none'
                                value={game.name}
                                onChange={(e) =>
                                    handleGameChange(
                                        game.id,
                                        'name',
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div className='flex flex-col grow '>
                            <label className='text-white'>
                                Humble Bundle URL (max 100 chars)
                            </label>
                            <input
                                id={`game-url-${game.id}`}
                                type='text'
                                className='rounded px-1 py-2 mt-1 mr-2'
                                value={game.url}
                                onChange={(e) =>
                                    handleGameChange(
                                        game.id,
                                        'url',
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div className='flex flex-col grow '>
                            <label className='text-white'>
                                Image URL - ensure it ends in .png or .jpg
                            </label>
                            <input
                                id={`game-url-${game.id}`}
                                type='text'
                                className='rounded px-1 py-2 mt-1 mr-2'
                                value={game.imageUrl}
                                onChange={(e) =>
                                    handleGameChange(
                                        game.id,
                                        'imageUrl',
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <CloseButton
                            className={`text-white mt-6 hover:text-gray-400 ${
                                isFirstGame(game) ? 'opacity-0' : ''
                            }`}
                            onClick={() =>
                                !isFirstGame(game) ? removeGame(game.id) : null
                            }
                        />
                    </div>
                    {error && <div className='text-red-500'>{error}</div>}
                    {isLastGame(game) && (
                        <button
                            onClick={addGame}
                            className='mr-auto text-white mt-5 cursor-pointer border-2 border-blue-600/40 hover:bg-blue-600 p-2 text-sm rounded transition ease-in-out delay-50 hover:-translate-y-1 hover:scale-110  duration-100'
                        >
                            Add new game
                        </button>
                    )}
                </>
            ))}

            <div className='flex justify-between items-start w-full mt-10'>
                <div className='flex flex-col'>
                    <h3 className='text-white font-bold text-2xl '>
                        Heres a preview 👇
                    </h3>

                    <div className='flex mt-1'>
                        {games.map((game, idx) => (
                            <button
                                className={
                                    'border border-purple-500 text-white px-2 mr-1 rounded ' +
                                    (idx === previewGameIndex
                                        ? 'bg-purple-500'
                                        : '')
                                }
                                onClick={() => setPreviewGameIndex(idx)}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                    <div className='max-w-[300px] h-[500px] mt-5'>
                        <App
                            isPreview={true}
                            panelText={panelText}
                            boldGameName={boldGameName}
                            gameName={games[previewGameIndex].name}
                            imageUrl={getGameImageUrl()}
                        />
                    </div>
                </div>
                <div className='max-w-[40%]'>
                    <h3 className='text-white font-bold text-2xl mb-5'>
                        Additional configuration ⚙️
                    </h3>
                    <p className='text-white font-bold text '>Panel text 📝</p>
                    <p className='text-gray-300  font-normal text-sm'>
                        use{' '}
                        <span className='text-white font-bold'>@gameName</span>{' '}
                        to insert the game name.{' '}
                        <span className='text-white text-xs font-semibold'>
                            (optional)
                        </span>
                    </p>
                    <p className='text-gray-300  font-normal text-sm mb-3'>
                        use{' '}
                        <span className='text-white font-bold'>@newLine</span>{' '}
                        to insert a new line.{' '}
                        <span className='text-white text-xs font-semibold'>
                            (optional)
                        </span>
                    </p>
                    <textarea
                        className='text-black w-50 p-2 rounded'
                        rows={4}
                        cols={40}
                        value={panelText}
                        onChange={(e) => setPanelText(e.target.value)}
                    />

                    <div className='flex items-center mt-3'>
                        <input
                            id='default-checkbox'
                            type='checkbox'
                            checked={boldGameName}
                            onChange={(e) => setBoldGameName(e.target.checked)}
                            className='w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded  dark:bg-gray-700 dark:border-gray-600'
                        />
                        <label
                            htmlFor='default-checkbox'
                            className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'
                        >
                            Bold @gameName ?
                        </label>
                    </div>
                    <p className='text-white font-bold text-lg mt-5'>
                        Fallback game image url 🖼️
                    </p>
                    <p className='text-gray-300 text-sm mb-2'>
                        If you didn't specify a game image url, we'll use our
                        default image or you can specify your own fallback image
                        URL <br />
                        It's probably best to make sure your URL ends in .jpg or
                        .png
                    </p>
                    <input
                        type='text'
                        placeholder='https://example.com/image.jpg'
                        className='rounded mt-1 px-1 py-2 mr-2 outline-none w-full'
                        value={fallbackImageUrl || ''}
                        onChange={(e) => setFallbackImageUrl(e.target.value)}
                    />
                </div>
            </div>

            <button
                onClick={handleSave}
                className={`ml-auto mt-10 text-white font-bold py-2 px-4 rounded transition ease-in-out delay-50 bg-blue-500 hover:-translate-y-1 hover:scale-110  duration-100 ${
                    saved ? 'bg-green-500' : 'bg-blue-500'
                } hover:bg-blue-700}`}
            >
                {saved ? 'Pog, saved! 🎉' : 'Save changes 🚀'}
            </button>
        </main>
    )
}

export default ConfigPage
