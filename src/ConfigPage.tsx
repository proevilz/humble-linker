import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import CloseButton from './components/CloseButton'

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
        <main className='flex flex-col px-3'>
            {games.map((game) => (
                <>
                    <div
                        key={game.id}
                        className='flex w-full items-center mb-4'
                    >
                        <div className='flex flex-col grow'>
                            <label className='text-white'>Game name</label>
                            <input
                                id={`game-name-${game.id}`}
                                type='text'
                                className='rounded-sm mt-1 px-1 py-2 mr-2 outline-none'
                                value={game.name}
                                onChange={(e) =>
                                    handleGameNameChange(
                                        game.id,
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div className='flex flex-col  grow'>
                            <label className='text-white'>
                                Humble Bundle URL
                            </label>
                            <input
                                id={`game-url-${game.id}`}
                                type='text'
                                className='rounded-sm px-1 py-2 mt-1 mr-2'
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
                            className='mr-auto text-white mt-5 cursor-pointer hover:text-gray-300'
                        >
                            Add new game
                        </button>
                    )}
                </>
            ))}
            {error && <div className='text-red-500'>{error}</div>}
            <button
                onClick={handleSave}
                className={`ml-auto mt-10 text-white font-bold py-2 px-4 rounded ${
                    saved ? 'bg-green-500' : 'bg-blue-500'
                } hover:bg-blue-700}`}
            >
                {saved ? 'Saved!' : 'Save'}
            </button>
        </main>
    )
}

export default ConfigPage
