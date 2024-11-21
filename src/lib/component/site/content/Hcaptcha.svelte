<script lang="ts" module>
    declare global {
        interface Window {
            sitekey: string;
            hcaptchaOnLoad: Function;
            onSuccess: Function;
            onError: Function;
            onClose: Function;
            onExpired: Function;
            hcaptcha: any;
        }
    }
  
    declare var hcaptcha: any;
  
    export type dark = "dark"
    export type light = "light"

    export const CaptchaTheme: { DARK: dark, LIGHT: light } = {
        DARK: 'dark',
        LIGHT: 'light',
    }
</script>
  
<script lang="ts">
    import { onDestroy, createEventDispatcher, onMount } from 'svelte'
    const browser = import.meta.env.SSR === undefined ? true : !import.meta.env.SSR
  
    const dispatch = createEventDispatcher()
  
    let {
        sitekey,
        apihost = 'https://js.hcaptcha.com/1/api.js',
        hl = '',
        reCaptchaCompat = false,
        theme = CaptchaTheme.DARK,
        size = 'normal'
    }: { 
        sitekey: string, 
        apihost?: string, 
        hl?: string, 
        reCaptchaCompat?: boolean, 
        theme?: dark | light, 
        size?: 'normal' | 'compact' | 'invisible' 
    } = $props()

    const id = Math.floor(Math.random() * 100000);
  
    let mounted = $state(false);
    let loaded = $state(false);
    let widgetID: any = $state(undefined);
    let scriptElement: HTMLScriptElement | null = null;

    const query = new URLSearchParams({
        recaptchacompat: reCaptchaCompat ? 'on' : 'off',
        onload: 'hcaptchaOnLoad',
        render: 'explicit',
    });
    const scriptSrc = `${apihost}?${query.toString()}`;

    function loadScript() {
        if (!browser || scriptElement) return;

        console.log('Creating script element');
        scriptElement = document.createElement('script');
        scriptElement.src = scriptSrc;
        
        scriptElement.onerror = () => {
            console.error('Failed to load hCaptcha script');
        };

        // Manually track script loading
        scriptElement.onload = () => {
            console.log('Script onload triggered');
        };

        document.head.appendChild(scriptElement);
    }

    function initializeWidget() {
        console.log('Attempting to initialize widget...');
        console.log('Mounted:', mounted);
        console.log('Loaded:', loaded);
        console.log('HCaptcha available:', typeof window !== 'undefined' && !!window.hcaptcha);

        if (!mounted || !loaded || !window.hcaptcha) {
            console.log('Conditions not met for initialization');
            return;
        }

        const containerId = `h-captcha-${id}`;
        const container = document.getElementById(containerId);
        console.log('Container found:', !!container, 'Container ID:', containerId);

        if (container) {
            try {
                const config = {
                    sitekey,
                    hl,
                    theme,
                    callback: 'onSuccess',
                    'error-callback': 'onError',
                    'close-callback': 'onClose',
                    'expired-callback': 'onExpired',
                    size,            
                };
                console.log('Rendering with config:', config);
                
                widgetID = window.hcaptcha.render(container, config);
                console.log('Widget rendered successfully, new widgetID:', widgetID);
            } catch (e) {
                console.error('Error rendering hCaptcha:', e);
            }
        }
    }

    onMount(() => {
        console.log('Component mounted');
        if (browser) {
            window.hcaptchaOnLoad = () => {
                console.log('hCaptcha script loaded callback triggered');
                loaded = true;
                dispatch('load');
                initializeWidget();
            };
    
            window.onSuccess = (token: string) => {
                console.log('Captcha success');
                dispatch('success', { token });
            };
    
            window.onError = () => {
                console.log('Captcha error');
                dispatch('error');
            }
    
            window.onClose = () => {
                console.log('Captcha closed');
                dispatch('close');
            }
            
            window.onExpired = () => {
                console.log('Captcha expired');
                dispatch('expired');
            }

            loadScript();
        }
  
        mounted = true;
    });
  
    onDestroy(() => {
        console.log('Component being destroyed');
        if (widgetID && window.hcaptcha) {
            try {
                window.hcaptcha.remove(widgetID);
                console.log('Widget removed successfully');
            } catch (e) {
                console.error('Error removing widget:', e);
            }
        }

        if (scriptElement && scriptElement.parentNode) {
            scriptElement.parentNode.removeChild(scriptElement);
        }

        if (browser) {
            //@ts-ignore
            window.hcaptchaOnLoad = null;
            //@ts-ignore
            window.onSuccess = null;
            //@ts-ignore
            window.onError = null;
            //@ts-ignore
            window.onClose = null;
            //@ts-ignore
            window.onExpired = null;
        }
    });
  
</script>

<div id="h-captcha-{id}" class="mx-auto"></div>