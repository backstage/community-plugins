# Goal

The inventory plugin saves items in the ~~software~~ catalog.

It should be possible to use it for 'personal' belongings and be scalable for corporates. Scalable in the way that it supports different optional levels of abstracts and types of locations.

To be clear: That it will not replace an inventory solution where companies track all their hardware.

## Inventory model

It should have primary two kinds of objects:

1. `Items`
   - Items like a caffee machine, a notebook, etc. The resource should have attributes to save an assignee and/or a location where the item 'should be'. A note, a picture, multiple IDs or serial numbers and when and where it was last seen.
   - Containers that can contains multiple items and have their own location, for example in a garage or shelf.
2. `Locations`
   - Shelf
   - Rooms
   - Floors
   - Buildings
   - Campus

You might want to save also movable items like cars, trucks, bikes with their location. But I like to define that out of scope until someone wants help with that. :smirk:
