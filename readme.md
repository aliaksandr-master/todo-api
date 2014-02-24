# 1. Commands

## 1.1 Dependencies. Install next Programs
    nodejs
    npm
    mysqldump
    npm install -g grunt-cli

## 1.2 exec for build node deps and build the project
    npm install

## 1.3 update build:
    npm install
    grunt install build
    grunt install watch

## 1.4 deployment build
    npm install
    grunt build-dev
    grunt build-test
    grunt build-prod

# 2 Описание Api системы
    "REQUEST_METHOD REQUEST_URL": {
        "access": {
            "ACCESS_DIRECTIVE_NAME": ACCESS_DIRECTIVE_VALUE
        },
        "request": [
            "[PARAM_TYPE]PARAM_NAME:DATA_TYPE{LENGTH}": ["VALIDATION_RULE"]
        ],
        "response:TYPE(MAX_LIMIT)": [
            "PARAM_NAME:DATA_TYPE"
        ]
    }

## 2.1 Описание Метода
    Каждый public запрос описывается объектом ключ которого является
        "REQUEST_METHOD REQUEST_URL": {}
    для того что бы закрыть какой либо запрос можно указать ! (или любой другой символ который не подходит по шаблону ([A-Z]+)) вначале описания и этот метод не будет обрабатываться

    REQUEST_METHOD
        Стандартные методы http POST, PUT, GET, DELETE, PATCH, HEAD, OPTION
        Обязательный параметр

    REQUEST_URL
        Описывается валидным URL. разделителем сегментов является слэш "/"
        Не должен начинаться и заканчиваться на "/"
        Может содержать вкропления входных параметров начинающихся с $ (будет рассказано далее)
        Обязательный параметр
        не может содержать в себе пробелых символов

    Примеры
        "POST user/login"
        "POST todo/$list_id/item/$item_id"
        "POST todo/$list_id/item/$item_id 11.2.33"

## 2.2 Описание параметров запроса
    Каждый вложенное описание назвается директивой, их может быть много. Они не могут повторяться внутри описания одного запроса
    Зарезервированны следующие директивы
        request
        response
        access
        handler
        man_url

### 2.2.1 request
Каждое входное значение может быть задано в форме

    "[PARAM_TYPE]PARAM_NAME:DATA_TYPE{LENGTH}^BEFORE_FILTER|AFTER_FILTER": "VALIDATION_RULE-1|VALIDATION_RULE-2"
    или валидация может быть заданна в виде массива                      : ["VALIDATION_RULE-1", "VALIDATION_RULE-2"]

или развернутый вариант (он в strict_mode = только так)

    "[PARAM_TYPE]PARAM_NAME:DATA_TYPE{LENGTH}": {
        "before": ["BEFORE_FILTER", "BEFORE_FILTER"],
        "rules": ["VALIDATION_RULE", "VALIDATION_RULE"],
        "after": ["AFTER_FILTER", "AFTER_FILTER"]
    }

#### PARAM_TYPE
Есть три типа входных данных:

* **[query]** - знак '@'. Приходит из Query-string-params (в урл запроса после "?").

* **[url]**   - знак '$'. Приходит из урл запроса в случае если заданы в имени описания

* **[body]**  - знак '>'. Приходит в теле запроса. его можно не писать вообще, все данные без обозначения = [body]. Соответсвтенно нету в GET запросе ( и не должен восприниматься сервером ).

#### PARAM_NAME
    Названия могут содержать только следующие символы, заданные шаблоном ([a-zA-Z0-9_]+)

#### DATA_TYPE
    Тип данных нужен для приведения к нему входного значения
    Если тип данных не указан - то по умолчанию это string
    Доступны следующие типы данных:
        :text - строка, по умолчанию не имеет ограничений по длине и не производится никаких процедур для приведения к формату
        :string - не может привышать длинной 255 символов (если не задано другого  в параметрах), убираются все пробельные символы (\s) в начале и конце строки (trim)
        :integer - целочиселнное значение. только цифры и знак.
        :decimal - целочиселнное значение. только цифры. без знака
        :float - число с плавающей точкой. только цифры, знак и точка (а не запятая). также воспринимается и формат "-0.2e-10"
        :boolean - преобразуется в булевское значение. Пустая строка, 0, '0' преобразуются в FALSE
    Для числовых типов по умолчанию не происходит trim и нет ограничения по длине. Но есть ограничение по формату

#### LENGTH
    Длина входного значения.
    После записи типа данных может быть описано длина входных данных. при этом можно описывать :
        {30} - жесткое соответствие длине строки
        {1,30} - длина от 1 до 30
        {4,} - длина должна быть от 4 до бесконечности
        {,50} - длина должна быть ограничена 50-ю символами
    В случае числовых типов знак "-" будет учитываться в длине строки. все положительные знчения не имеют знака.
    по типу данных и длине производится валидация correct['DATA_TYPE','LENGTH'].
    В случае не корректно введенных данных - вернется ощибка "correct" и параметрами

#### BEFORE_FILTER
    Это перечисление последовательности процедур для приведение к нужному формату
    Все :string получают автоматически trim и xss фильтры
    Доступны
        trim
        xss
        to_string
        to_integer
        to_boolean
        to_float
        camelcase
        underscorecase
        dashcase
        capitalize
        uppercase
        lowercase

#### AFTER_FILTER
    Это закрытое свойство. в компилируемом открытом апи этого не будет указано.
    Это перечисление постфильтров для параметра.
    Производятся после всех валидаций
    доступны все BEFORE_FILTER фильтры, а также
        password - реализуется системой
        key('SOME') - переназывает ключ
        и другие, которые написаны в системе.

#### VALIDATION_RULE
    Правила валидации могут быть как встроенные в систему, так и добавленные специально для необходимого модуля
    Обязательные правила только: optional и required - они не могут быть заданы одновременно. В случае если не задан ни один - по умолчанию это означает 'required'
    Правила могут записываться как в форме массива, так и в форме сплошной строки, правила при этом разделяются вертикальной чертой "|"
    Правила могут иметь параметры, при этом параметры записываются в JSON строки. Значения не должны содержать одиночных ковычек. Знак одиночной ковычки используются как алиас для экраниования двойной ковычки
    примеры правил:
        required
        need
        matches['inputName']
        min_length['value']
        max_length['value']
        exact_length['value']
        alpha
        alpha_numeric
        alpha_dash
        numeric
        integer
        decimal
        is_natural
        is_natural_no_zero
        valid_base64
        valid_email
        valid_url
        valid_date
        unique"

#### Примеры
    "$user_id:number{1,11}|trim": "required|exists"
    "@is_active:boolean": "optional"
    "password:string{6,25}": "optional"
    ">view_name:string{3,30}|trim": "required"
    "last_name:string{3,30}^trim": "required"
    "first_name:string{3,30}|trim": ["required"]

    Система не должна взять больше параметров чем заявлено в описании. если взяла - то это баг

### 2.2.2 Response

    формат описания выходных данных
        "response:TYPE(MAX_LIMIT)": [
            "OUTPUT_PARAM_NAME:DATA_TYPE",
            "OUTPUT_PARAM_NAME:DATA_TYPE"
        ]
    или
        "response:TYPE(MAX_LIMIT)": {
            data: [
                "OUTPUT_PARAM_NAME:DATA_TYPE",
                "OUTPUT_PARAM_NAME:DATA_TYPE"
            ],
            meta: [
                "META_NAME:DATA_TYPE",
                "META_NAME:DATA_TYPE"
            ]
        }

    TYPE
        есть только несколько типов
            :one - отдаст только один обьект (самый первый, в случае если будут выводится системой несколько...)
            :many - отдаст массив объект, по умолчанию ограничен 255 объектами (MAX_LIMIT = 255)
        По умолчанию :one

    MAX_LIMIT
        Может указано только число, говорящее о максимально допустимом значении выдаваемых объектов
        Задается в случае если необходимо ограничить количество выдаваемых элементов.
        для задания MAX_LIMIT необходимо обязательно задать FORMAT :many
        MAX_LIMIT по умолчанию равен 255
        это может быть только :decimal тип

### 2.2.3 Access
    Задается параметрами системы.
    only_owner: false - можно изменить в случае если залогинен и user_id равен user_id создателя записи.
    need_login: false - необходимо авторизоваться
    only_ajax:  false - пропускается только Ajax-запрос
    ip_white_list: [] - пропускать запросы только с этих IP адресов (все остальные игнорируются),
    ip_black_list: [] - запрещать все запросы с этих IP

## 2.3 Описание входных и выходных форматов

    OUTPUT_FORMAT
        Задается в заголовках accept
        говорит в каком виде вернуть данные
        доступны:
            xml
            json = application/json - по умолчанию

    INPUT_FORMAT
        Задается в загаловках Content-Type
        говорит в каком типе понимать входные данные
        доступны:
            form - application/x-www-form-urlencoded
            xml  = xhtml+xml
            json = application/json


## 2.4 ПРИМЕР ОПИСАНИЯ
    "PUT user/$id": {
        "access": {
            "need_login": true,
            "only_owner": true
        },
        "request" : {
            "$id:integer": "optional|exists",
            "username:string": "optional|need['password_old']|unique",
            "email:string": "required|valid_email|unique|need['password_old']",
            "password_old:string": "optional|valid_password",
            "password_new:string": "optional|matches['password_new_confirm']|need['password_old']",
            "password_new_confirm:string": "optional|matches['password_new']|need['password_old']"
        },
        "response": [
            "id:integer",
            "username:string",
            "email:string"
        ]
    },