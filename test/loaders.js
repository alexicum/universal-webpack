import chai from 'chai'
chai.should()

import { find_style_rules, loader_name_filter, parse_loader, stringify_loader, normalize_rule_loaders } from '../source/loaders'

describe(`webpack loader utilities`, function()
{
	it(`should find style loaders`, function()
	{
		let configuration

		configuration =
		{
			module:
			{
				rules:
				[{
					use:
					[{
						loader: 'not-a-style-loader'
					}]
				},
				{
					use:
					[{
						loader: 'style-loader'
					}]
				},
				{
					use:
					[{
						loader : '/Users/kuchumovn/work/CollegeConsortium/node_modules/extract-text-webpack-plugin/loader.js',
						omit   : 1
					},
					{
						loader : 'style-loader'
					},
					{
						loader : 'css-loader'
					}]
				}]
			}
		}

		find_style_rules(configuration).should.deep.equal
		([{
			use:
			[{
				loader: 'style-loader'
			}]
		}])
	})

	it(`should detect style loader`, function()
	{
		loader_name_filter('style')('style-loader').should.equal(true)
		loader_name_filter('style')('style-loader?query=true&gay=porn').should.equal(true)
		loader_name_filter('style')('style').should.equal(true)
		loader_name_filter('style')('style?query=true').should.equal(true)

		loader_name_filter('style')('style_loader').should.equal(false)
	})

	it(`should parse loaders`, function()
	{
		const parsed =
		{
			loader: 'style-loader',
			options:
			{
				query: 'true',
				gay: 'porn'
			}
		}

		parse_loader('style-loader?query=true&gay=porn').should.deep.equal(parsed)
		parse_loader({ loader: 'style-loader?query=true&gay=porn' }).should.deep.equal(parsed)
		parse_loader({ loader: 'style-loader', query: 'query=true&gay=porn' }).should.deep.equal(parsed)
		parse_loader({ loader: 'style-loader', options: 'query=true&gay=porn' }).should.deep.equal(parsed)
		parse_loader({ loader: 'style-loader', query: { query: 'true', 'gay': 'porn' }}).should.deep.equal(parsed)
		parse_loader({ loader: 'style-loader', options: { query: 'true', 'gay': 'porn' }}).should.deep.equal(parsed)
	})

	it(`should stringify loaders`, function()
	{
		stringify_loader
		({
			loader: 'style-loader',
			options:
			{
				query: 'true',
				gay: 'porn'
			}
		})
		.should.equal('style-loader?query=true&gay=porn')
	})

	it(`should normalize loaders`, function()
	{
		let loader

		// Convert `loader` and `query` to `use` and `options`

		loader =
		{
			loader: 'style-loader',
			query:
			{
				query: 'true',
				gay: 'porn'
			}
		}

		normalize_rule_loaders(loader)

		loader.should.deep.equal
		({
			use:
			[{
				loader: 'style-loader',
				options:
				{
					query: 'true',
					gay: 'porn'
				}
			}]
		})

		// Convert `use` string to array

		loader =
		{
			use: 'style-loader'
		}

		normalize_rule_loaders(loader)

		loader.should.deep.equal
		({
			use:
			[{
				loader: 'style-loader'
			}]
		})

		// Shouldn't convert compound `loader` and `query`

		loader =
		{
			loader: 'style-loader!another-loader',
			query:
			{
				query: true,
				gay: 'porn'
			}
		}

		let execute = () => normalize_rule_loaders(loader)
		execute.should.throw(`You have both a compound ".loader" and a ".query"`)

		// No `loader` is specified

		loader =
		{
			query:
			{
				query: 'true',
				gay: 'porn'
			}
		}

		execute = () => normalize_rule_loaders(loader)
		execute.should.throw(`Neither "loaders" nor "loader" nor "use" are present inside a module rule`)

		// Convert compound `loader` to `use` array

		loader =
		{
			loader: 'style-loader?query=true&gay=porn!css-loader?a=b'
		}

		normalize_rule_loaders(loader)

		loader.should.deep.equal
		({
			use:
			[{
				loader: 'style-loader',
				options:
				{
					query: 'true',
					gay: 'porn'
				}
			},
			{
				loader: 'css-loader',
				options:
				{
					a: 'b'
				}
			}]
		})
	})
})