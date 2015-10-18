# Pimatic models
This file contains an overview of the different models of Pimatic, including properties

## Page

- **id** string	- The id of the page
- **name** string - The display name of the page
- **devices** list - A list of objects
	- **deviceId** string - The id of the device

## Device

- **id** string	- The id of the device
- **name** string - The display name of the device
- **template** string - The name of the template to use
- **attributes** list 
	- **description** string - Description of the attribute
	- **discrete** boolean
	- **history** list - List of objects
		- **t** number The time of the history item
		- **v** mixed The value on that time
	- **label** string - The display name of the attribute
	- **labels** list - Strings acting as labels for different values.
	- **lastUpdate** number
	- **name** string - Unique name of the attribute
	- **type** string - Type of the attribute
	- **value** mixed - Current value
- **actions** list
	- **name** string
	- **description** string
	- **params** object
		- **{name}**
			- **type** string
- **config** object - A key-value list
	- **{name}** mixed 
- **configDefaults** object - A key-value list
	
## Groups

- **id** string	- The id of the group
- **name** string - The display name of the group
- **rules** list - Rules in this group
- **devices** list - Devices in this group
- **variables** list - Variables in this group

## Variables

## Rules