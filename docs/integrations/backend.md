---
title: Backend & MVC
parent: Integrations
nav_order: 2
---

# Integrating with Backend MVC

Meld is ideal for "Island Architecture" in server-rendered apps. You can drop interactive widgets into your Blade, Twig, or EJS templates without converting the whole app to an SPA.

## Laravel (Blade)
Use Meld to replace complex jQuery widgets or to add interactivity to specific views.

**1. Place Meld in resources:** Put `meld.core.js` and your components in `resources/js/components/`.

**2. Import in `app.js`:** ```javascript
// resources/js/app.js
import './components/user-card.js';
import './components/chart-widget.js';
````

**3. Use in Blade View:** 
```blade
@extends('layouts.app')

@section('content')
    <h1>Dashboard</h1>
    
    <div class="grid">
        <user-card 
            username="{{ $user->name }}" 
            role="{{ $user->role }}">
        </user-card>
    </div>
@endsection
```

-----

## Symfony (Twig)

Similar to Laravel, use Webpack Encore or AssetMapper to load the script.

**1. Import in `app.js`:** 
```javascript
// assets/app.js
import './meld-components/alert-box.js';
```

**2. Use in Twig:** 
```twig
{# templates/base.html.twig #}
<body>
    <h1>Symfony App</h1>
    
    {# Pass Twig variables to Meld #}
    <alert-box type="success" message="{{ flash_message }}"></alert-box>
</body>
```

-----

## Express.js (EJS/Pug)

Serve Meld as a static asset.

**1. Setup Static Folder:** 
```javascript
app.use(express.static('public'));
```

**2. Use in EJS Template:** 
```html
<!DOCTYPE html>
<html>
<body>
    <h1>Express View</h1>
    
    <meld-chat room-id="<%= roomId %>"></meld-chat>

    <script type="module" src="/js/components/meld-chat.js"></script>
</body>
</html>