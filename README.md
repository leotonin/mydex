# MyDex

A simple, minimal PokéDex.

## Features

- Minimalistic, clean and responsive frontend
- Information is retrieved from [PokeAPI](https://pokeapi.co/)
- No server-side code! Can be easily deployed on hosting services for static sites, such as Neocities, GitHub Pages...
- No dependencies such as Bootstrap, jQuery...
- The driver script comes with a cache to minimize the risk of running into API rate limit errors

## Limitations

For the time being, MyDex only retrieves Pokémon from generations 1 to 8. PokeAPI is serving erroneous information for the vast majority of Pokémon from generation 9 (see [issue \#863](https://github.com/PokeAPI/pokeapi/issues/863) for an example). Instead of showing incorrect data, I opted to show no data at all.

## To-do

- Add a language change button and more i18n options
- Test and check that the error messages are displaying correctly when they are expected to
- Code refactoring and optimization?

## Contributing

Forks, pull requests and suggestions are more than welcome. This is a little hobby

## License

This project is released under the MIT License. See [LICENSE.txt](./LICENSE.txt) for the full license text.
