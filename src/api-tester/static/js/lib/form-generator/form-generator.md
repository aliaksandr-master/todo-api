### ПРИМЕР СПЕЦИФИКАЦИИ ДЛЯ ГЕНЕРАЦИИ ФОРМЫ:

```js

	var spec = [

		{hello: 'decimal'},

		{params: {

			type: 'array',

			spec: [

				{val:   {type: 'string'}},

				{id:    {type: 'decimal'}},

				{object: {

					type: 'object',

					spec: [

						{username: {type: 'string'}},

						{password: {type: 'decimal'}},

						{save: {type: 'boolean'}}

					]

				}}

			]

		}},

		{options: {

			type: 'object',

			spec: [

				{username: {type: 'string'}},

				{password: {type: 'decimal'}},

				{save: {type: 'boolean'}},

				{object: {

					type: 'object',

					spec: [

						{username: {type: 'string'}},

						{password: {type: 'decimal'}},

						{save: {type: 'boolean'}}

					]

				}}

			]

		}}

	]
```

### ПРИМЕР ЗАДАНИЯ ЗНАЧЕНИЙ ДЛЯ ЭТОЙ ФОРМЫ

```js
	var values = {
		hello: '111 hello!!!',
		params: [
			{
				val: 333,
				object: {
					username: 333444
				}
			},
			{
				val: 111,
				object: {
					username: 2222222
				}
			}
		],
		options: {
			username: 'victor!',
			object: {
				password: 112222333
			}
		}
	}
```

## OPTIONS

### ОПИСАНИЕ ТИПОВ ДАННЫХ

```js
	templates: {

		'form': function (data) { // единственный обязательный шаблон, который должен быть создан ('form')

			return '<form>' + data.value.join('') + '</form>'

		}

		// доступны параметры,

			data.name, - имя поля (обложки)
			data.value, - значение , в случае обложки (nested) будет являеться массивом вложенных в нее элементов
			data.nested, - флаг обложки
			data.inner,  - говорит, что вляется элементом внутри массива
			data.type,   - тип поля (обложки)
			data.attr    - атрибуты, которые заданы с помощью функции attr(name) в настройках генератора

		'field': function (data) {

			return '<input id="' + data.attr.id + '" data.name="' + data.value + '" value="' + data.value + '"/>'

		} // Функция должна отдавать строку

	}
```
```js

	types: {

			text: {
				array:    false, // Спецификация элемента может мультиплицироваться
				nested:   false, // тип данных при котором разрешено вложеннасть
				template: 'text' // название темлэйта
			},

			string: {
				array:    false,
				nested:   false,
				template: 'field'
			},

			decimal: {
				array:    false,
				nested:   false,
				template: 'field'
			},

			float: {
				array:    false,
				nested:   false,
				template: 'field'
			},

			integer: {
				array:    false,
				nested:   false,
				template: 'field'
			},

			boolean: {
				array:    false,
				nested:   false,
				template: 'flag'
			},

			object: {
				nested:   true,
				array:    false,
				template: 'cover'
			},

			array: {
				array:    true,
				nested:   true,
				template: 'cover'
			}
	}
```