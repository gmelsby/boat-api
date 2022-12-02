# Cloud Application Development Final Project
Gregory Melsby \
melsbyg@oregonstate.edu \
Fall 2022

Application deployed at: https://melsbyg-cloud-final.uw.r.appspot.com

## Data Model
The application store three kinds of entities in Datastore: Boats, Loads and Users. \
There is a one-to-many relationship of Boats to Loads: one Boat can hold many Loads. \
There is a one-to-many relationship of Users to Boats: one User can own many Boats. \
Boats are a protected resource, and only a Boat's owner may perform CRUD operations on the Boat. \
A Boat's owner is the user that created the Boat.

### Boats
|Property|Description|Type|Notes|
|---|---|---|---|
|name|name of the boat|string| Required. Cannot be null. Must not include the characters "<>{}[]". Must not be an empty string or over 30 characters in length. Must not have whitespace at the beginning or end of string.|
|type|type of the boat|string| Required. Cannot be null. Must not include the characters "<>{}[]". Must not be an empty string or over 30 characters in length. Must not have whitespace at the beginning or end of string.|
|length|length of the boat in feet|integer| Required. Must be a positive integer.|
|id|id of the boat|integer|Created automatically upon creation. Do not include in POST body.|
|owner|user id of the boat's owner|string|Created automatically upon creation based on creating user. Do not include in POST body.|

### Loads
|Property|Description|Type|Notes|
|---|---|---|---|
|volume|volume of the load in cubic feet|integer| Required. Must be a positive integer.|
|item|item in the load|string| Required. Cannot be null. Must not include the characters "<>{}[]". Must not be an empty string or over 30 characters in length. Must not have whitespace at the beginning or end of string.|
|creation_date|date the load was created|string| Required. Cannot be null. Must be of the form "XX/XX/XXXX" where each group of characters is a number.|
|id|id of the load|integer|Created automatically upon creation. Do not include in POST body.|
|carrier|id of the boat the load is on|integer|Set to null upon creation, can be updated with PUT on /boats/:boatId/loads/:loadId. Do not include in POST body.|

### Users
|Property|Description|Type|Notes|
|---|---|---|---|
|id|id of the user. "sub" property of user JWT.|string| Created upon first user login.|
|email|email address of the user|string| Created upon first user login.|


# Create A Boat
## POST /boats
Allows creation of a new boat. Boats are a protected resource, so request must contain a valid JWT.

## Request
### Path Parameters
None

### Request Headers
|Header|Notes|
|---|---|
|Authorization| must be set to a Bearer token of a registered user|
|Accepts| must be set to application/json|

### Request Body
Required

### Request Body Format
JSON

### Request JSON Attributes
|Property|Description|Type|Notes|
|---|---|---|---|
|name|name of the boat|string| Required. Cannot be null. Must not include the characters "<>{}[]". Must not be an empty string or over 30 characters in length. Must not have whitespace at the beginning or end of string.|
|type|type of the boat|string| Required. Cannot be null. Must not include the characters "<>{}[]". Must not be an empty string or over 30 characters in length. Must not have whitespace at the beginning or end of string.|
|length|length of the boat in feet|integer| Required. Must be a positive integer.|

### Request Body Example
```
{
    "name": "Sloop John Boone",
    "type": "Sloop",
    "length": 50
}
```

## Response

### Response Body Format
JSON

### Response Statuses
|Outcome|Status Code|Notes|
|---|---|---|
|Success|201 Created||
|Failure|400 Bad Request|If the request is missing any of the 3 required attributes, the boat will not be created.
|Failure|401 Unauthorized|If the "Authorization" header is not set to a valid JWT, no boat will be created.
|Failure|406 Not Acceptable|If the "Accept" header does not indicate application/json will be accepted, no boat will be created.

### Response Examples
### Success
```
Status: 201 Created

Body:
{
    "name": "Sloop John Boone",
    "type": "Sloop",
    "length": 50,
    "owner": "auth0|6383e893a8b2c2ec60b332c9",
    "id": "5665673409724416",
    "loads": [],
    "self": "https://melsbyg-cloud-final.uw.r.appspot.com/boats/5665673409724416"
}
```
### Failure

Missing Required Property
```
Status: 400 Bad Request 

Body:
{
    "Error": "Request is missing one or more required properties"
}
```
Extra Property Present
```
Status: 400 Bad Request 

Body:
{
    "Error": "One or more properties in the request are not valid"
}
```

Value of 'name' is not valid
```
Status: 400 Bad Request 

Body:
{
    "Error": "name value in request is not valid"
}
```
Value of 'type' is not valid
```
Status: 400 Bad Request 

Body:
{
    "Error": "type value in request is not valid"
}
```
Value of 'length' is not valid
```
Status: 400 Bad Request 

Body:
{
    "Error": "length value in request is not valid"
}
```
Syntax error in JSON
```
Status: 400 Bad Request 

Body:
{
    "Error": "Unexpected string in JSON at position 13"
}
```
Invalid or missing JWT Bearer Token in Authorization header
```
Status: 401 Unauthorized

Body:
{
    "Error": "Bad Credentials"
}
```
Accept header does not indicate application/json is acceptable
```
Status: 406 Not Acceptable

Body:
{
    "Error": "Endpoint only can respond with application/json data"
}
```

# Get List of Owned Boats
## GET /boats
Gets a list of user's boats. Boats are a protected resource, so request must contain a valid JWT. Only the boats that belong to the user whose JWT is in the Authorization header as a Bearer token. Response is paginated and returns at most 5 boats per page.

## Request
### Path Parameters
None

### Request Headers
|Header|Notes|
|---|---|
|Authorization| must be set to a Bearer token of a registered user|
|Accepts| must be set to application/json|

### Query Parameters
|Name|Description|
|---|---|
|cursor|Optional. Corresponds to a Datastore cursor. Helps implement pagination.

### Request Body
None

## Response

### Response Body Format
JSON

### Response Statuses
|Outcome|Status Code|Notes|
|---|---|---|
|Success|200 OK||
|Failure|400 Bad Request|If the 'cursor' query parameter is not recognized by Datastore, no list of boats will be returned.
|Failure|401 Unauthorized|If the "Authorization" header is not set to a valid JWT, no list of boats will be returned.
|Failure|406 Not Acceptable|If the "Accept" header does not indicate application/json will be accepted, no list of boats will be returned.

### Response Examples
### Success
The URL indicated by "next" is how the next page of results is accessed. \
If "next" is not present, there are no more results. \
"count" indicates the total number of boats the user owns. 
```
Status: 200 OK

Body:
{
    "boats": [
        {
            "name": "Pequod",
            "type": "Whaler",
            "length": 200,
            "owner": "auth0|6383e893a8b2c2ec60b332c9",
            "id": "5069549128908800",
            "loads": [],
            "self": "https://melsbyg-cloud-final.uw.r.appspot.com/boats/5069549128908800"
        },
        {
            "name": "Great Big Boat",
            "owner": "auth0|6383e893a8b2c2ec60b332c9",
            "type": "Schooner",
            "length": 55,
            "id": "5081054809423872",
            "loads": [],
            "self": "https://melsbyg-cloud-final.uw.r.appspot.com/boats/5081054809423872"
        },
        {
            "type": "Sloop",
            "name": "Sloop John Boone",
            "length": 50,
            "owner": "auth0|6383e893a8b2c2ec60b332c9",
            "id": "5665673409724416",
            "loads": [],
            "self": "https://melsbyg-cloud-final.uw.r.appspot.com/boats/5665673409724416"
        },
        {
            "name": "Challenger",
            "length": 5,
            "owner": "auth0|6383e893a8b2c2ec60b332c9",
            "type": "Kayak",
            "id": "5712837116690432",
            "loads": [],
            "self": "https://melsbyg-cloud-final.uw.r.appspot.com/boats/5712837116690432"
        },
        {
            "type": "Starship",
            "length": 250,
            "owner": "auth0|6383e893a8b2c2ec60b332c9",
            "name": "Enterprise",
            "id": "6205318602162176",
            "loads": [],
            "self": "https://melsbyg-cloud-final.uw.r.appspot.com/boats/6205318602162176"
        }
    ],
    "next": "https://melsbyg-cloud-final.uw.r.appspot.com/boats?cursor=CjISLGoXenV3fm1lbHNieWctY2xvdWQtZmluYWxyEQsSBEJvYXQYgICAmMX2ggsMGAAgAA%3D%3D",
    "count": 6
}
```
### Failure

'cursor' query parameter not recognized by Datastore
```
Status: 400 Bad Request 

Body:
{
    "Error": "Cursor in request params not recognized"
}
```
Invalid or missing JWT Bearer Token in Authorization header
```
Status: 401 Bad Request 

Body:
{
    "Error": "Bad Credentials"
}
```

Accept header does not indicate application/json is acceptable
```
Status: 406 Not Acceptable

Body:
{
    "Error": "Endpoint only can respond with application/json data"
}
```

# Get Boat by Id
## GET /boats/:boatId
Gets representation of boat with passed-in id. Boats are a protected resource, so request must contain a valid JWT. Boat representation will be retrieved only if the boat belongs to the user whose JWT is in the Authorization header as a Bearer token.

## Request
### Path Parameters
|Name|Description|
|---|---|
|boatId|id of the boat to be retrieved|

### Request Headers
|Header|Notes|
|---|---|
|Authorization| must be set to a Bearer token of a registered user|
|Accepts| must be set to application/json|

### Query Parameters
None

### Request Body
None

## Response

### Response Body Format
JSON

### Response Statuses
|Outcome|Status Code|Notes|
|---|---|---|
|Success|200 OK||
|Failure|401 Unauthorized|If the "Authorization" header is not set to a valid JWT, no boat will be returned.
|Failure|403 Forbidden|If no boat exists with the passed-in boatId or if the "Authorization" header is set to a valid JWT but the JWT does not correspond to the user who owns the boat, no boat will be returned.
|Failure|406 Not Acceptable|If the "Accept" header does not indicate application/json will be accepted, no boat will be returned.

### Response Examples
### Success
```
Status: 200 OK

Body:
{
    "length": 50,
    "type": "Sloop",
    "owner": "auth0|6383e893a8b2c2ec60b332c9",
    "name": "Sloop John Boone",
    "loads": [],
    "id": "5673082664517632",
    "self": "https://melsbyg-cloud-final.uw.r.appspot.com/boats/5673082664517632"
}
```
### Failure
Invalid or missing JWT Bearer Token in Authorization header
```
Status: 401 Bad Request 

Body:
{
    "Error": "Bad Credentials"
}
```

Boat with passed-in id does not exist or JWT in Authorization header corresponds to a user who does not own the boat
```
Status: 403 Forbidden

{
    "Error": "Boat does not exist or is owned by someone else"
}
```

Accept header does not indicate application/json is acceptable
```
Status: 406 Not Acceptable

Body:
{
    "Error": "Endpoint only can respond with application/json data"
}
```

# Edit Boat with PUT
## PUT /boats/:boatId
Edits boat with passed-in id. Boats are a protected resource, so request must contain a valid JWT. Boat will be edited only if the boat belongs to the user whose JWT is in the Authorization header as a Bearer token. Requires all required attributes in request body.

## Request
### Path Parameters
|Name|Description|
|---|---|
|boatId|id of the boat to be edited|

### Request Headers
|Header|Notes|
|---|---|
|Authorization| must be set to a Bearer token of a registered user|
|Accepts| must be set to application/json|

### Query Parameters
None

### Request Body
Required

### Request Body Format
JSON

### Request JSON Attributes
|Property|Description|Type|Notes|
|---|---|---|---|
|name|name of the boat|string| Required. Cannot be null. Must not include the characters "<>{}[]". Must not be an empty string or over 30 characters in length. Must not have whitespace at the beginning or end of string.|
|type|type of the boat|string| Required. Cannot be null. Must not include the characters "<>{}[]". Must not be an empty string or over 30 characters in length. Must not have whitespace at the beginning or end of string.|
|length|length of the boat in feet|integer| Required. Must be a positive integer.|

### Request Body Example
```
{
    "name": "Sloop John B",
    "type": "Beach Boy Vessel",
    "length": 55
}
```

## Response

### Response Body Format
JSON

### Response Statuses
|Outcome|Status Code|Notes|
|---|---|---|
|Success|200 OK||
|Failure|400 Bad Request|If the request is missing any of the 3 required attributes, the boat will not be edited.|
|Failure|401 Unauthorized|If the "Authorization" header is not set to a valid JWT, the boat will not be edited.
|Failure|403 Forbidden|If no boat exists with the passed-in boatId or if the "Authorization" header is set to a valid JWT but the JWT does not correspond to the user who owns the boat, no boat will not be edited.
|Failure|406 Not Acceptable|If the "Accept" header does not indicate application/json will be accepted, no boat will be returned.

### Response Examples
### Success
```
Status: 200 OK

Body:
{
    "name": "Sloop John B",
    "type": "Beach Boy Vessel",
    "length": 55,
    "owner": "auth0|6383e893a8b2c2ec60b332c9",
    "id": "5673082664517632",
    "loads": [],
    "self": "https://melsbyg-cloud-final.uw.r.appspot.com/boats/5673082664517632"
}
```
### Failure
Missing Required Property
```
Status: 400 Bad Request 

Body:
{
    "Error": "Request is missing one or more required properties"
}
```
Extra Property Present
```
Status: 400 Bad Request 

Body:
{
    "Error": "One or more properties in the request are not valid"
}
```

Value of 'name' is not valid
```
Status: 400 Bad Request 

Body:
{
    "Error": "name value in request is not valid"
}
```
Value of 'type' is not valid
```
Status: 400 Bad Request 

Body:
{
    "Error": "type value in request is not valid"
}
```
Value of 'length' is not valid
```
Status: 400 Bad Request 

Body:
{
    "Error": "length value in request is not valid"
}
```
Syntax error in JSON
```
Status: 400 Bad Request 

Body:
{
    "Error": "Unexpected string in JSON at position 13"
}
```
Invalid or missing JWT Bearer Token in Authorization header
```
Status: 401 Unauthorized

Body:
{
    "Error": "Bad Credentials"
}
```

Boat with passed-in id does not exist or JWT in Authorization header corresponds to a user who does not own the boat
```
Status: 403 Forbidden

{
    "Error": "Boat does not exist or is owned by someone else"
}
```

Accept header does not indicate application/json is acceptable
```
Status: 406 Not Acceptable

Body:
{
    "Error": "Endpoint only can respond with application/json data"
}
```

# Edit Boat with PATCH
## PATCH /boats/:boatId
Edits boat with passed-in id. Boats are a protected resource, so request must contain a valid JWT. Boat will be edited only if the boat belongs to the user whose JWT is in the Authorization header as a Bearer token. Not all properties are required in request body. Included properties will update on the boat and other properties will remain the same.

## Request
### Path Parameters
|Name|Description|
|---|---|
|boatId|id of the boat to be edited|

### Request Headers
|Header|Notes|
|---|---|
|Authorization| must be set to a Bearer token of a registered user|
|Accepts| must be set to application/json|

### Query Parameters
None

### Request Body
Required

### Request Body Format
JSON

### Request JSON Attributes
|Property|Description|Type|Notes|
|---|---|---|---|
|name|name of the boat|string| If included, cannot be null. Must not include the characters "<>{}[]". Must not be an empty string or over 30 characters in length. Must not have whitespace at the beginning or end of string.|
|type|type of the boat|string| If included, cannot be null. Must not include the characters "<>{}[]". Must not be an empty string or over 30 characters in length. Must not have whitespace at the beginning or end of string.|
|length|length of the boat in feet|integer| If included, must be a positive integer.|

### Request Body Example
```
{
    "length": 60
}
```

## Response

### Response Body Format
JSON

### Response Statuses
|Outcome|Status Code|Notes|
|---|---|---|
|Success|200 OK||
|Failure|400 Bad Request|If the properties in the request are not valid, the boat will not be edited.|
|Failure|401 Unauthorized|If the "Authorization" header is not set to a valid JWT, the boat will not be edited.
|Failure|403 Forbidden|If no boat exists with the passed-in boatId or if the "Authorization" header is set to a valid JWT but the JWT does not correspond to the user who owns the boat, no boat will not be edited.
|Failure|406 Not Acceptable|If the "Accept" header does not indicate application/json will be accepted, no boat will be returned.

### Response Examples
### Success
```
Status: 200 OK

Body:
{
    "name": "Sloop John B",
    "owner": "auth0|6383e893a8b2c2ec60b332c9",
    "type": "Beach Boy Vessel",
    "length": 60,
    "id": "5673082664517632",
    "loads": [],
    "self": "https://melsbyg-cloud-final.uw.r.appspot.com/boats/5673082664517632"
}
```
### Failure
Extra Property Present
```
Status: 400 Bad Request 

Body:
{
    "Error": "One or more properties in the request are not valid"
}
```

Value of 'name' is not valid
```
Status: 400 Bad Request 

Body:
{
    "Error": "name value in request is not valid"
}
```
Value of 'type' is not valid
```
Status: 400 Bad Request 

Body:
{
    "Error": "type value in request is not valid"
}
```
Value of 'length' is not valid
```
Status: 400 Bad Request 

Body:
{
    "Error": "length value in request is not valid"
}
```
Syntax error in JSON
```
Status: 400 Bad Request 

Body:
{
    "Error": "Unexpected string in JSON at position 13"
}
```
Invalid or missing JWT Bearer Token in Authorization header
```
Status: 401 Unauthorized

Body:
{
    "Error": "Bad Credentials"
}
```

Boat with passed-in id does not exist or JWT in Authorization header corresponds to a user who does not own the boat
```
Status: 403 Forbidden

{
    "Error": "Boat does not exist or is owned by someone else"
}
```

Accept header does not indicate application/json is acceptable
```
Status: 406 Not Acceptable

Body:
{
    "Error": "Endpoint only can respond with application/json data"
}
```

# Delete Boat
## DELETE /boats/:boatId
Deletes boat with passed-in id. Boats are a protected resource, so request must contain a valid JWT. Boat will be deleted only if the boat belongs to the user whose JWT is in the Authorization header as a Bearer token.

## Request
### Path Parameters
|Name|Description|
|---|---|
|boatId|id of the boat to be deleted|

### Request Headers
|Header|Notes|
|---|---|
|Authorization| must be set to a Bearer token of a registered user|

### Query Parameters
None

### Request Body
None

## Response

### Response Body Format
Success: No body \
Failure: JSON

### Response Statuses
|Outcome|Status Code|Notes|
|---|---|---|
|Success|204 No Content||
|Failure|401 Unauthorized|If the "Authorization" header is not set to a valid JWT, the boat will not be delted.
|Failure|403 Forbidden|If no boat exists with the passed-in boatId or if the "Authorization" header is set to a valid JWT but the JWT does not correspond to the user who owns the boat, no boat will not be deleted.

### Response Examples
### Success
```
Status: 204 No Content
```
### Failure
Invalid or missing JWT Bearer Token in Authorization header
```
Status: 401 Unauthorized

Body:
{
    "Error": "Bad Credentials"
}
```

Boat with passed-in id does not exist or JWT in Authorization header corresponds to a user who does not own the boat
```
Status: 403 Forbidden

{
    "Error": "Boat does not exist or is owned by someone else"
}
```


# Create A Load
## POST /loads
Allows creation of a new load.

## Request
### Path Parameters
None

### Request Headers
|Header|Notes|
|---|---|
|Accepts| must be set to application/json|

### Request Body
Required

### Request Body Format
JSON

### Request JSON Attributes

|Property|Description|Type|Notes|
|---|---|---|---|
|volume|volume of the load in cubic feet|integer| Required. Must be a positive integer.|
|item|item in the load|string| Required. Cannot be null. Must not include the characters "<>{}[]". Must not be an empty string or over 30 characters in length. Must not have whitespace at the beginning or end of string.|
|creation_date|date the load was created|string| Required. Cannot be null. Must be of the form "XX/XX/XXXX" where each group of characters is a number.|

### Request Body Example
```
{
    "volume": 50,
    "item": "Roses",
    "creation_date": "10/20/2022"
}
```

## Response

### Response Body Format
JSON

### Response Statuses
|Outcome|Status Code|Notes|
|---|---|---|
|Success|201 Created||
|Failure|400 Bad Request|If the request is missing any of the 3 required attributes, the boat will not be created.
|Failure|406 Not Acceptable|If the "Accept" header does not indicate application/json will be accepted, no boat will be created.

### Response Examples
### Success
```
Status: 201 Created

Body:
{
    "volume": 50,
    "item": "Roses",
    "creation_date": "10/20/2022",
    "carrier": null,
    "id": "5702893864747008",
    "self": "https://melsbyg-cloud-final.uw.r.appspot.com/loads/5702893864747008"
}
```
### Failure

Missing Required Property
```
Status: 400 Bad Request 

Body:
{
    "Error": "Request is missing one or more required properties"
}
```
Extra Property Present
```
Status: 400 Bad Request 

Body:
{
    "Error": "One or more properties in the request are not valid"
}
```

Value of 'volume' is not valid
```
Status: 400 Bad Request 

Body:
{
    "Error": "volume value in request is not valid"
}
```
Value of 'item' is not valid
```
Status: 400 Bad Request 

Body:
{
    "Error": "item value in request is not valid"
}
```
Value of 'creation_date' is not valid
```
Status: 400 Bad Request 

Body:
{
    "Error": "creation_date value in request is not valid"
}
```
Syntax error in JSON
```
Status: 400 Bad Request 

Body:
{
    "Error": "Unexpected string in JSON at position 13"
}
```
Accept header does not indicate application/json is acceptable
```
Status: 406 Not Acceptable

Body:
{
    "Error": "Endpoint only can respond with application/json data"
}
```

# Get All Loads
## GET /loads
Gets a list of all loads. Response is paginated and returns at most 5 boats per page.

## Request
### Path Parameters
None

### Request Headers
|Header|Notes|
|---|---|
|Accepts| must be set to application/json|

### Query Parameters
|Name|Description|
|---|---|
|cursor|Optional. Corresponds to a Datastore cursor. Helps implement pagination.

### Request Body
None

## Response

### Response Body Format
JSON

### Response Statuses
|Outcome|Status Code|Notes|
|---|---|---|
|Success|200 OK||
|Failure|400 Bad Request|If the 'cursor' query parameter is not recognized by Datastore, no list of loads will be returned.
|Failure|406 Not Acceptable|If the "Accept" header does not indicate application/json will be accepted, no list of loads will be returned.

### Response Examples
### Success
The URL indicated by "next" is how the next page of results is accessed. \
If "next" is not present, there are no more results. \
"count" indicates the total number of loads.
```
Status: 200 OK

Body:
{
    "loads": [
        {
            "carrier": null,
            "item": "Water Bottles",
            "creation_date": "09/20/2001",
            "volume": 80,
            "id": "4802063531769856",
            "self": "https://melsbyg-cloud-final.uw.r.appspot.com/loads/4802063531769856"
        },
        {
            "carrier": null,
            "volume": 70,
            "item": "Bananas",
            "creation_date": "09/20/2000",
            "id": "5075408403824640",
            "self": "https://melsbyg-cloud-final.uw.r.appspot.com/loads/5075408403824640"
        },
        {
            "item": "Roses",
            "carrier": null,
            "creation_date": "10/21/2022",
            "volume": 40,
            "id": "5638358357245952",
            "self": "https://melsbyg-cloud-final.uw.r.appspot.com/loads/5638358357245952"
        },
        {
            "volume": 60,
            "carrier": null,
            "creation_date": "10/20/2000",
            "item": "Phones",
            "id": "5679095853613056",
            "self": "https://melsbyg-cloud-final.uw.r.appspot.com/loads/5679095853613056"
        },
        {
            "creation_date": "10/20/2022",
            "carrier": {
                "id": "6263382969679872",
                "self": "https://melsbyg-cloud-final.uw.r.appspot.com/boats/6263382969679872"
            },
            "volume": 50,
            "item": "Roses",
            "id": "5702893864747008",
            "self": "https://melsbyg-cloud-final.uw.r.appspot.com/loads/5702893864747008"
        }
    ],
    "next": "https://melsbyg-cloud-final.uw.r.appspot.com/loads?cursor=CjISLGoXenV3fm1lbHNieWctY2xvdWQtZmluYWxyEQsSBExvYWQYgICAmIfYkAoMGAAgAA%3D%3D",
    "count": 6
}
```
### Failure

'cursor' query parameter not recognized by Datastore
```
Status: 400 Bad Request 

Body:
{
    "Error": "Cursor in request params not recognized"
}
```

Accept header does not indicate application/json is acceptable
```
Status: 406 Not Acceptable

Body:
{
    "Error": "Endpoint only can respond with application/json data"
}
```

# Get Load by Id
## GET /loads/:loadId
Gets representation of load with passed-in id. 

## Request
### Path Parameters
|Name|Description|
|---|---|
|loadId|id of the load to be retrieved|

### Request Headers
|Header|Notes|
|---|---|
|Accepts| must be set to application/json|

### Query Parameters
None

### Request Body
None

## Response

### Response Body Format
JSON

### Response Statuses
|Outcome|Status Code|Notes|
|---|---|---|
|Success|200 OK||
|Failure|404 Not Found|If no load exists with the passed-in loadId, no boat will be returned.
|Failure|406 Not Acceptable|If the "Accept" header does not indicate application/json will be accepted, no boat will be returned.

### Response Examples
### Success
```
Status: 200 OK

Body:
{
    "length": 50,
    "type": "Sloop",
    "owner": "auth0|6383e893a8b2c2ec60b332c9",
    "name": "Sloop John Boone",
    "loads": [],
    "id": "5673082664517632",
    "self": "https://melsbyg-cloud-final.uw.r.appspot.com/boats/5673082664517632"
}
```
### Failure
Invalid or missing JWT Bearer Token in Authorization header
```
Status: 401 Bad Request 

Body:
{
    "Error": "Bad Credentials"
}
```

Boat with passed-in id does not exist or JWT in Authorization header corresponds to a user who does not own the boat
```
Status: 403 Forbidden

{
    "Error": "Boat does not exist or is owned by someone else"
}
```

Accept header does not indicate application/json is acceptable
```
Status: 406 Not Acceptable

Body:
{
    "Error": "Endpoint only can respond with application/json data"
}
```

