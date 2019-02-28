# Central End User Registry API Documentation
***

In this guide, we'll walk through the different Central End User Registry endpoints:
* `POST` [**Create user**](#create-user)
* `GET` [**Get user by number**](#get-user-by-number)
* `GET` [**Get all users**](#get-all-users) 
* `GET` [**Health**](#health)

Information about various errors returned can be found here:
* [**Error Information**](#error-information)

The different endpoints often deal with these [data structures:](#data-structures) 
* [**User Object**](#user-object)

***

## Endpoints

### **Create user**
This endpoint allows a user to be registered and used with the registry.

#### HTTP Request
```POST http://central-end-user-registry/register```

#### Headers
| Field | Type | Description |
| ----- | ---- | ----------- |
| Content-Type | String | Must be set to `application/json` |

#### Request body
| Field | Type | Description |
| ----- | ---- | ----------- |
| number | String | Number for user to associate with DFSP |
| dfspIdentifier | String | Identifier for DFSP assigned by Central Directory |

#### Response 201 Created
| Field | Type | Description |
| ----- | ---- | ----------- |
| Object | User | The [User object](#user-object) created |

#### Request
``` http
POST http://central-directory/commands/register HTTP/1.1
Content-Type: application/json
{
  "number": "12345679",
  "dfspIdentifier": "001:124"
}
```

#### Response
``` http
HTTP/1.1 201 CREATED
Content-Type: application/json
{
  "number": "123456789",
  "dfspIdentifier": "001:124"
}
```

#### Errors (4xx)
| Field | Description |
| ----- | ----------- |
| AlreadyExistsError | The number has already been registered for this DFSP |
``` http
{
  "id": "AlreadyExistsError",
  "message": "The number has already been registered for this DFSP"
}
```

### **Get user by number**
This endpoint retrieves a user's information from the registry by number.

#### HTTP Request
```GET http://central-end-user-registry/users/{number}```

#### Query Params
| Field | Type | Description |
| ----- | ---- | ----------- |
| number | String | Number for the user |

#### Response 200 OK
| Field | Type | Description |
| ----- | ---- | ----------- |
| Object | Array | List of registered [User objects](#user-object) for the number |

#### Request
```http
GET http://central-end-user-registry/users/12345678 HTTP/1.1 HTTP/1.1
```

#### Response
``` http
HTTP/1.1 200 OK
[
  {
    "number": "12345678",
    "dfspIdentifier": "001:123"
  }
]
```

#### Errors (4xx)
| Field | Description |
| ----- | ----------- |
| NotFoundError | The requested resource could not be found |
``` http
{
  "id": "NotFoundError",
  "message": "The requested resource could not be found."
}
```

### **Get all users**
This endpoint allows retrieval of all of the registry's users

#### HTTP Request
```GET http://central-end-user-registry/users```

#### Response 200 OK
| Field | Type | Description |
| ----- | ---- | ----------- |
| Object | Array | List of supported [User objects](#user-object) |


#### Request
```http
GET http://central-end-user-registry/users HTTP/1.1
```

#### Response
``` http
HTTP/1.1 200 OK
[
  {
    "number": "12345678",
    "dfspIdentifier": "001:123"
  },
  {
    "number": "90123456",
    "dfspIdentifier": "001:321"
  },
  {
    "number": "08901234",
    "dfspIdentifier": "001:456"
  }
]
```

### Health
Get the current status of the service

#### HTTP Request
`GET http://central-end-user-registry/health`

#### Response 200 OK
| Field | Type | Description |
| ----- | ---- | ----------- |
| status | String | The status of the end user registry, *OK* if the service is working |

#### Request
``` http
GET http://central-end-user-registry/health HTTP/1.1
```

#### Response
``` http
HTTP/1.1 200 OK
{
  "status": "OK"
}
```

***

## Data Structures

### User Object

Represents a user that has registered with the Central End User Registry.

| Name | Type | Description |
| ---- | ---- | ----------- |
| number | String | Number for user to associate with DFSP |
| dfspIdentifier | String | Identifier for DFSP assigned by Central Directory |

***

## Error information

This section identifies the potential errors returned and the structure of the response.

An error object can have the following fields:

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | String | An identifier for the type of error |
| message | String | A message describing the error that occurred |
| validationErrors | Array | *Optional* An array of validation errors |
| validationErrors[].message | String | A message describing the validation error |
| validationErrors[].params | Object | An object containing the field that caused the validation error |
| validationErrors[].params.key | String | The name of the field that caused the validation error |
| validationErrors[].params.value | String | The value that caused the validation error |
| validationErrors[].params.child | String | The name of the child field |

``` http
HTTP/1.1 404 Not Found
Content-Type: application/json
{
  "id": "InvalidUriParameterError",
  "message": "Error validating one or more uri parameters",
  "validationErrors": [
    {
      "message": "number with value \"79544291a\" fails to match the required pattern: /^[0-9]{1,8}$/",
      "params": {
        "value": "79544291a",
        "key": "number"
      }
    }
  ]
}
```
