<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 - Page Not Found</title>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])

    <script>
        // On page load or when changing themes, best to add inline in `head` to avoid FOUC
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    </script>
</head>

<body class="h-full antialiased bg-background text-foreground font-sans">
    <div id="app" class="flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <div class="flex flex-col items-center max-w-lg text-center">
            <h1 class="text-9xl font-bold text-foreground">404</h1>

            <div class="mt-6">
                <div class="relative">
                    <div class="h-px w-20 bg-gradient-to-r from-transparent via-muted-foreground to-transparent"></div>
                </div>
            </div>

            <h2 class="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Page not found</h2>

            <p class="mt-4 text-base leading-7 text-muted-foreground">
                Sorry, we couldn't find the page you're looking for.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 mt-10">
                <a href="{{ url('/') }}" class="rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                    Go back home
                </a>
                <button onclick="window.history.back()" class="rounded-md bg-secondary text-secondary-foreground px-5 py-2.5 text-sm font-semibold shadow-sm ring-1 ring-inset ring-border hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:cursor-pointer">
                    Go back
                </button>
            </div>
        </div>
    </div>
</body>

</html>