import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import App from './App'
import CloseButton from './components/CloseButton'
import humbleFallBack from './assets/humble-fallback.png'
const ConfigPage = () => {
    interface Game {
        name: string
        url: string
        id: string
    }
    const regex =
        /^https?:\/\/(?:www\.)?humblebundle\.com(?:\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;=]*)?$/

    const [games, setGames] = useState<Game[]>([
        { id: uuidv4(), name: 'test', url: 'test' },
    ])
    const [error, setError] = useState<string | null>(null)
    const [saved, setSaved] = useState(false)
    const [panelText, setPanelText] = useState(
        " Like the game I'm currently playing? It's a game called @gameName"
    )
    const [boldGameName, setBoldGameName] = useState(true)
    const [fallbackImageUrl, setFallbackImageUrl] = useState<string | null>(
        null
    )
    const addGame = () => {
        setGames([...games, { id: uuidv4(), name: '', url: '' }])
    }

    const isLastGame = (game: Game) => {
        return games.indexOf(game) === games.length - 1
    }
    const handleGameNameChange = (id: string, value: string) => {
        const updatedGames = games.map((game: Game) => {
            if (game.id === id) {
                return { ...game, name: value }
            }
            return game
        })
        setGames(updatedGames)
    }
    const handleGameUrlChange = (id: string, value: string) => {
        const updatedGames = games.map((game: Game) => {
            if (game.id === id) {
                return { ...game, url: value }
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
        //function to test that all of the urls are valid
        const isValid = (url: string) => {
            return regex.test(url)
        }
        //function to test that all of the names are valid
        const isNameValid = (name: string) => {
            return name.length > 0
        }
        //function to test that all of the games are valid
        const isGameValid = (game: Game) => {
            return isValid(game.url) && isNameValid(game.name)
        }
        //function to test that all of the games are valid
        const areGamesValid = (games: Game[]) => {
            return games.every(isGameValid)
        }
        //if all of the games are valid, save them
        if (areGamesValid(games)) {
            console.log('games are valid')
            //save games
            window.Twitch.ext.configuration.set(
                'broadcaster',
                '1.0',
                JSON.stringify(games)
            )

            setSaved(true)
            setTimeout(() => {
                setSaved(false)
            }, 2000)
            return
        }
        setError(
            'Invalid game(s) detected. Please check your games and try again.'
        )
    }

    useEffect(() => {
        const config = window.Twitch.ext.configuration.broadcaster?.content
        if (config) {
            setGames(JSON.parse(config))
        }
    }, [])
    return (
        <main className='flex flex-col px-3 mt-5'>
            <h1 className='text-white font-bold text-2xl mb-10'>
                Configure games and links 🕹️
            </h1>
            {games.map((game) => (
                <>
                    <div
                        key={game.id}
                        className='flex w-full items-center mb-4'
                    >
                        <div className='flex flex-col  grow '>
                            <label className='text-white'>Game name</label>
                            <input
                                id={`game-name-${game.id}`}
                                type='text'
                                className='rounded mt-1 px-1 py-2 mr-2 outline-none'
                                value={game.name}
                                onChange={(e) =>
                                    handleGameNameChange(
                                        game.id,
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div className='flex flex-col grow '>
                            <label className='text-white'>
                                Humble Bundle URL
                            </label>
                            <input
                                id={`game-url-${game.id}`}
                                type='text'
                                className='rounded px-1 py-2 mt-1 mr-2'
                                value={game.url}
                                onChange={(e) =>
                                    handleGameUrlChange(game.id, e.target.value)
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
                                value={game.url}
                                onChange={(e) =>
                                    handleGameUrlChange(game.id, e.target.value)
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
                    {isLastGame(game) && (
                        <button
                            onClick={addGame}
                            className='mr-auto text-white mt-5 cursor-pointer border-2 border-purple-600/40 hover:bg-purple-600 p-2 text-sm rounded transition ease-in-out delay-50 hover:-translate-y-1 hover:scale-110  duration-100'
                        >
                            Add new game
                        </button>
                    )}
                </>
            ))}

            <div className='flex justify-between items-start w-full mt-10'>
                <div className='flex flex-col'>
                    <h3 className='text-white font-bold text-2xl mb-3'>
                        Heres a preview 👇
                    </h3>
                    <div className='max-w-[300px] h-[500px]'>
                        <App
                            isPreview={true}
                            panelText={panelText}
                            boldGameName={boldGameName}
                            imageUrl={fallbackImageUrl ?? null}
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
                            value=''
                            className='w-4 h-4 text-purple-500 bg-gray-100 border-gray-300 rounded  dark:bg-gray-700 dark:border-gray-600'
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
            {error && <div className='text-red-500'>{error}</div>}
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
