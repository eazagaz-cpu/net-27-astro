import type { HelpDocs } from '../types';
import { CONTACT_EMAIL } from '../../../lib/constants';

/**
 * English source of the three troubleshooting guides and the app download page,
 * transcribed verbatim from the original routes.
 *
 * Inline markup: `**bold**` and `[label](href)`. Device paths keep their
 * `Settings > X > Y` wording; the `>` is written plainly and escaped at render.
 */
const en: HelpDocs = {
  appNotInstalled: {
    breadcrumb: 'App Not Installed',
    breadcrumbParent: 'Help',
    seoTitle: 'Fix App Not Installed Error — NetMirror',
    seoDescription:
      'Fix the App Not Installed error when installing NetMirror APK. Step-by-step solutions for all Android devices.',
    h1Prefix: 'Fix:',
    h1Highlight: 'App Not Installed',
    intro:
      'The "App Not Installed" error appears when Android cannot complete the APK installation process. This is one of the most common issues Android users encounter when installing apps from outside the Play Store. The good news is that it is almost always fixable by following a few straightforward steps.',
    sections: [
      {
        heading: 'Common Causes',
        blocks: [
          {
            t: 'cards',
            cards: [
              {
                title: '1. Insufficient Storage Space',
                text: 'Android needs free space not only for the APK file itself but also for unpacking and installing it. If your device has less than 100 MB of free internal storage, the installation may fail silently with this error. Apps that report their size as 15-25 MB may need up to 50 MB during the installation process.',
              },
              {
                title: '2. Unknown Sources Not Enabled',
                text: 'Android blocks installations from sources other than the Play Store by default. On Android 8.0 and newer, you need to grant installation permission to the specific app you use to open the APK (usually your browser or file manager). On older versions, there is a single toggle under Settings > Security.',
              },
              {
                title: '3. Corrupted or Incomplete Download',
                text: "If your internet connection was interrupted during the download, or if the file was modified in transit, the APK may be corrupted. A corrupted file cannot be verified by Android's package installer, resulting in an installation failure.",
              },
              {
                title: '4. Wrong CPU Architecture',
                text: 'If you downloaded the ARM64 version but your device uses a 32-bit processor (or vice versa), the APK will not install. This is the most common cause when the Universal version works but a specific architecture version does not.',
              },
              {
                title: '5. Signature Mismatch',
                text: 'If you have an older version of NetMirror installed that was signed with a different certificate, Android will prevent the update. This can happen if the previous version was obtained from an unofficial source.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Step-by-Step Solutions',
        blocks: [
          {
            t: 'steps',
            steps: [
              {
                title: 'Free Up Storage Space',
                text: 'Go to **Settings > Storage** and ensure you have at least 100 MB of free internal storage. Clear cache from large apps if needed: **Settings > Apps > [App Name] > Clear Cache**. Do not clear data unless you want to reset that app.',
              },
              {
                title: 'Enable Installation from Unknown Sources',
                text: '**Android 8.0+:** Go to **Settings > Apps > Special Access > Install unknown apps** and enable it for your browser (Chrome, Firefox, etc.). **Android 7 and below:** Go to **Settings > Security** and toggle on "Unknown Sources."',
              },
              {
                title: 'Re-download the APK',
                text: 'Delete the existing APK file from your Downloads folder, then download it again from the [official download page](/app/download/). Make sure the download completes fully before attempting installation.',
              },
              {
                title: 'Use the Universal APK',
                text: 'If you downloaded a specific architecture version (ARM64 or ARM32), try the Universal APK from the [download page](/app/download/) instead. It supports all device types and eliminates architecture mismatch issues.',
              },
              {
                title: 'Uninstall the Previous Version',
                text: 'If you are updating from an older version, uninstall the existing NetMirror app first: **Settings > Apps > NetMirror > Uninstall**. Then install the new APK. This resolves signature mismatch issues.',
              },
              {
                title: 'Restart Your Device',
                text: 'A simple restart can clear temporary system issues that may be blocking the installation. After restarting, try the installation again.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Additional Tips',
        blocks: [
          {
            t: 'prose',
            paragraphs: [
              'If you are using a Samsung device, check whether **Secure Folder** or **Knox** is interfering with the installation. Some enterprise-managed devices have additional restrictions that block sideloaded apps.',
              'On Xiaomi and MIUI devices, you may need to disable **MIUI Optimization** temporarily in Developer Options, or grant additional permissions through the Security app.',
              'If you are using a **Huawei** device without Google services, the installation process is the same. NetMirror does not depend on Google Play Services to function.',
            ],
          },
        ],
      },
      {
        heading: 'Related Help Articles',
        blocks: [
          {
            t: 'linkCards',
            cards: [
              {
                title: 'Download NetMirror APK',
                text: 'Get the latest version of NetMirror for your device.',
                href: '/app/download/',
              },
              {
                title: 'Parsing Package Error',
                text: 'Fix "problem parsing the package" during installation.',
                href: '/help/parsing-package-error/',
              },
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        question: 'Why does my phone say "App Not Installed" when I try to install NetMirror?',
        answer:
          'This error typically occurs when there is a signature mismatch between the existing app and the update, insufficient storage space, or when the APK was downloaded for the wrong CPU architecture. Follow the step-by-step solutions on this page to resolve the issue.',
      },
      {
        question: 'Will I lose my data if I uninstall and reinstall NetMirror?',
        answer:
          'If you uninstall the existing version before installing the new one, any locally stored preferences or history may be cleared. However, if you have an account, your watchlist and settings are synced and will be restored after you sign in again.',
      },
      {
        question: 'How do I check if I have enough storage for NetMirror?',
        answer:
          'Go to Settings > Storage on your Android device. NetMirror requires approximately 50 MB of free space for the installation and initial data. If your storage is low, try clearing cache from other apps or moving media files to an SD card.',
      },
      {
        question: 'Can I install NetMirror on an SD card?',
        answer:
          'While Android allows some apps to be moved to an SD card after installation, the initial installation must happen on internal storage. After installing, you may be able to move it via Settings > Apps > NetMirror > Storage > Change.',
      },
      {
        question: 'The error persists after trying all solutions. What should I do?',
        answer:
          `If you have tried all the steps on this page and the error continues, your device may have a restriction set by your manufacturer or mobile carrier. Try downloading the Universal APK from our website on a different browser, or contact us at ${CONTACT_EMAIL} with your device model and Android version for personalized help.`,
      },
    ],
    disclaimerLabel: 'Disclaimer:',
    disclaimer:
      'NetMirror is a content discovery platform. It does not host, store, or distribute copyrighted content. Android is a trademark of Google LLC. Device manufacturer names are trademarks of their respective owners. For further assistance, contact',
  },

  parsingPackageError: {
    breadcrumb: 'Parsing Package Error',
    breadcrumbParent: 'Help',
    seoTitle: 'Fix Parsing Package Error — NetMirror APK',
    seoDescription:
      "Fix 'There was a problem parsing the package' error when installing NetMirror APK. Step-by-step causes and solutions.",
    h1Prefix: 'Fix:',
    h1Highlight: 'Parsing Package Error',
    intro:
      'The "There was a problem parsing the package" error appears when Android\'s built-in package installer cannot read or verify the APK file. This prevents the installation from starting at all. Unlike the "App Not Installed" error which occurs during installation, the parsing error means Android could not even begin the process. The issue is almost always related to the APK file itself or your device\'s compatibility.',
    sections: [
      {
        heading: 'Causes and How to Fix Them',
        blocks: [
          {
            t: 'cards',
            roomy: true,
            cards: [
              {
                title: '1. Corrupted or Incomplete Download',
                text: 'This is the most common cause. If your internet connection dropped or fluctuated during the download, the APK file may have been only partially saved. Android cannot parse an incomplete file.',
                solutionHeading: 'Solution:',
                ordered: true,
                items: [
                  'Delete the existing APK file from your Downloads folder.',
                  'Connect to a stable Wi-Fi network.',
                  "Clear your browser's cache and downloads history.",
                  'Download the APK again from the [official download page](/app/download/).',
                  'Wait for the download to finish completely before tapping the file.',
                ],
              },
              {
                title: '2. Incompatible Android Version',
                text: 'NetMirror requires Android 6.0 (Marshmallow, API level 23) or higher. If your device runs an older version of Android, the system will not be able to parse the APK because it contains features not available on your OS version.',
                solutionHeading: 'Solution:',
                ordered: true,
                items: [
                  'Check your Android version: **Settings > About Phone > Android Version**.',
                  'If your version is below 6.0, check if a system update is available: **Settings > System > Software Update**.',
                  'If no update is available, your device may not be supported. Consider using NetMirror through the web browser at **net-27.cc** instead.',
                ],
              },
              {
                title: '3. File Was Modified or Tampered With',
                text: 'Some file managers, cloud storage services, or download managers modify the APK file during transfer. Antivirus apps may also quarantine or alter parts of the file, making it unparseable.',
                solutionHeading: 'Solution:',
                ordered: true,
                items: [
                  'Download the APK directly from your browser (Chrome, Firefox, or Brave) without using a third-party download manager.',
                  'Temporarily disable any antivirus or security app, download the APK, then re-enable the security app.',
                  'Do not transfer the APK through messaging apps (WhatsApp, Telegram file share) as they may compress or modify the file.',
                ],
              },
              {
                title: '4. Android Package Installer Is Malfunctioning',
                text: 'In rare cases, the Android package installer itself can have cached bad data that causes it to fail when parsing any APK file, not just NetMirror.',
                solutionHeading: 'Solution:',
                ordered: true,
                items: [
                  'Go to **Settings > Apps > Show system apps**.',
                  'Find "Package Installer" or "Package Manager" in the list.',
                  'Tap **Clear Cache** and **Clear Data**.',
                  'Restart your device.',
                  'Try installing the APK again.',
                ],
              },
              {
                title: '5. APK File Extension Was Changed',
                text: 'Some browsers or file managers may change the file extension during download (for example, saving it as .zip instead of .apk). If the file extension is incorrect, Android will not recognize it as an installable package.',
                solutionHeading: 'Solution:',
                ordered: true,
                items: [
                  'Open your file manager and navigate to the Downloads folder.',
                  'Check that the file name ends with **.apk** (not .zip, .bin, or anything else).',
                  'If the extension is wrong, rename the file to end with **.apk**.',
                  'If renaming does not help, delete the file and download a fresh copy.',
                ],
              },
            ],
          },
        ],
      },
      {
        heading: 'Quick Fix Checklist',
        blocks: [
          {
            t: 'checklist',
            items: [
              'Delete the APK and re-download it on a stable connection',
              'Verify your Android version is 6.0 or higher',
              'Download using Chrome, Firefox, or Brave directly from the official site',
              'Check that the file ends with .apk',
              'Try the Universal APK from the [download page](/app/download/) if a specific version fails',
              'Clear the Package Installer cache and restart your device',
            ],
          },
        ],
      },
      {
        heading: 'Related Help Articles',
        blocks: [
          {
            t: 'linkCards',
            cards: [
              {
                title: 'Download NetMirror APK',
                text: 'Get the latest version with verified file sizes.',
                href: '/app/download/',
              },
              {
                title: 'App Not Installed Error',
                text: 'Different error that occurs during installation, not parsing.',
                href: '/help/app-not-installed/',
              },
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        question: 'What does "There was a problem parsing the package" mean?',
        answer:
          "This error message means that Android's package installer could not read and verify the APK file you are trying to install. The file may be corrupted, incompatible with your Android version, or incomplete. It is a generic error that covers several different underlying causes.",
      },
      {
        question: 'Can a parsing error be caused by my Android version being too old?',
        answer:
          'Yes. NetMirror requires Android 6.0 (Marshmallow) or higher. If your device runs an older version, the APK will contain features and API calls that your system cannot understand, which triggers the parsing error. Check your Android version in Settings > About Phone > Android Version.',
      },
      {
        question: 'I downloaded the APK from the official site but still get this error. Why?',
        answer:
          'Even when downloading from the official source, network issues can cause partial or corrupted downloads. Try deleting the APK file, clearing your browser cache, and downloading it again on a stable Wi-Fi connection. Verify that the file size matches what is shown on the download page.',
      },
      {
        question: 'Does renaming the APK file cause parsing errors?',
        answer:
          'Renaming the APK file extension (for example, changing .apk to .zip and back) can corrupt the file metadata. However, simply renaming the file while keeping the .apk extension should not cause issues. If you have renamed the file, try downloading a fresh copy instead.',
      },
      {
        question: 'Will clearing my device cache fix the parsing error?',
        answer:
          'Clearing the system cache partition can sometimes resolve persistent parsing errors caused by corrupted cache data. To clear the cache partition, restart your device in recovery mode and select "Wipe Cache Partition." This does not delete your personal data or apps. For most users, simply re-downloading the APK is sufficient.',
      },
    ],
    disclaimerLabel: 'Disclaimer:',
    disclaimer:
      'NetMirror is a content discovery platform. It does not host, store, or distribute copyrighted content. Android is a trademark of Google LLC. All device manufacturer names are trademarks of their respective owners. For further assistance, contact',
  },

  videoNotPlaying: {
    breadcrumb: 'Video Not Playing',
    breadcrumbParent: 'Help',
    seoTitle: 'Fix Video Not Playing — NetMirror Help',
    seoDescription:
      'Fix video playback issues on NetMirror. Solutions for buffering, black screen and server errors on Android and PC browsers.',
    h1Prefix: 'Fix:',
    h1Highlight: 'Video Not Playing',
    intro:
      'Video playback issues on NetMirror can range from complete failure to load, to buffering, black screens, or audio-only playback. Since NetMirror aggregates content from multiple external sources, the solution often involves switching servers or adjusting your device settings. This guide covers the most common causes and their fixes.',
    sections: [
      {
        heading: 'Common Causes and Fixes',
        blocks: [
          {
            t: 'cards',
            roomy: true,
            cards: [
              {
                title: 'Slow or Unstable Internet Connection',
                text: 'The most frequent cause of video playback problems is an unreliable internet connection. Streaming video requires a consistent minimum bandwidth, and even brief dropouts can cause the player to stall.',
                solutionHeading: 'How to fix:',
                items: [
                  'Switch from mobile data to Wi-Fi, or vice versa, to test which connection is more stable.',
                  'Move closer to your Wi-Fi router if you are on a wireless connection.',
                  'Close other apps and browser tabs that may be consuming bandwidth.',
                  'Run a speed test to confirm you have at least 5 Mbps download speed.',
                  'If using a VPN, try disconnecting it temporarily as VPNs can add latency.',
                ],
              },
              {
                title: 'Server Is Down or Overloaded',
                text: 'NetMirror sources content from multiple external servers. Individual servers can go offline or become overloaded during peak viewing hours, causing playback failures or slow loading times.',
                solutionHeading: 'How to fix:',
                items: [
                  'Use the server selector in the player to switch to a different source.',
                  'Try at least 3-4 different servers before concluding a title is unavailable.',
                  'Wait a few minutes and try again if all servers are failing during peak hours.',
                  'Some servers work better in certain regions due to CDN location.',
                ],
              },
              {
                title: 'Black Screen or Audio-Only Playback',
                text: 'When you can hear the audio but see only a black screen, the issue is usually related to video codec compatibility. Some older devices or certain browsers do not support newer video formats like H.265/HEVC.',
                solutionHeading: 'How to fix:',
                items: [
                  'Switch to a different server that may use a more compatible video codec.',
                  'If using a browser, try a different one (Chrome, Firefox, or Brave).',
                  'Lower the video quality setting if available in the player controls.',
                  'On the Android app, ensure hardware acceleration is enabled in your device settings.',
                  'Update your browser or the NetMirror app to the latest version.',
                ],
              },
              {
                title: 'Player Shows Error Message',
                text: 'Error messages like "Playback failed," "Content not available," or "403 Forbidden" indicate that the specific content link has expired or the source is blocking access from your location.',
                solutionHeading: 'How to fix:',
                items: [
                  'Switch to a different server immediately as the current source link may have expired.',
                  'Refresh the page completely and select the title again.',
                  'Clear your browser cache and cookies, then try again.',
                  'If you see "403 Forbidden," the server may be geo-restricted. Try a different server.',
                ],
              },
              {
                title: 'Subtitles Not Loading',
                text: 'Subtitle availability varies by server and title. Not all servers provide subtitle tracks, and some may only offer subtitles in certain languages.',
                solutionHeading: 'How to fix:',
                items: [
                  'Check the subtitle settings within the video player controls.',
                  'Switch to a different server that may have better subtitle support.',
                  'Some servers embed subtitles into the video (hardcoded) while others offer selectable tracks.',
                ],
              },
            ],
          },
        ],
      },
      {
        heading: 'How to Switch Servers',
        blocks: [
          {
            t: 'steps',
            intro:
              'Switching servers is the single most effective troubleshooting step for video playback issues on NetMirror. Here is how to do it:',
            steps: [
              {
                title: 'Open the Player',
                text: 'Navigate to the title you want to watch and open the player page.',
              },
              {
                title: 'Find the Server List',
                text: 'Look for server options or tabs near the player. They are usually labeled as "Server 1," "Server 2," or by server name.',
              },
              {
                title: 'Select a Different Server',
                text: 'Tap on a different server option. The player will reload with the new source. Wait a few seconds for it to buffer and begin playback.',
              },
              {
                title: 'Try Multiple Servers',
                text: 'If the first alternative server does not work, keep trying others. Different servers have different content libraries and performance characteristics.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Device-Specific Tips',
        blocks: [
          {
            t: 'tipGrid',
            tips: [
              {
                title: 'Android App',
                items: [
                  'Keep the NetMirror app updated to the latest version.',
                  'Clear the app cache: Settings > Apps > NetMirror > Clear Cache.',
                  'Ensure battery optimization is not killing the app in the background.',
                ],
              },
              {
                title: 'Web Browser (PC / Mobile)',
                items: [
                  'Disable ad blockers for the NetMirror website, as they can block player scripts.',
                  'Use Chrome, Firefox, Brave, or Edge for the best compatibility.',
                  'Clear browser cache and cookies if the player fails to load.',
                ],
              },
            ],
          },
        ],
      },
      {
        heading: 'Related Help Articles',
        blocks: [
          {
            t: 'linkList',
            links: [
              { label: 'Download the latest NetMirror APK', href: '/app/download/' },
              { label: 'Fix "App Not Installed" error', href: '/help/app-not-installed/' },
              { label: 'Contact support for further help', href: '/contact/' },
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        question: 'Why does the video show a black screen with audio?',
        answer:
          'A black screen with working audio usually indicates a hardware decoding issue. Try switching to a different server or player within NetMirror. Some older devices struggle with certain video codecs, especially H.265/HEVC. If the problem persists, lowering the video quality can help since it often switches to a more compatible codec.',
      },
      {
        question: 'Why does video keep buffering or loading?',
        answer:
          'Buffering is typically caused by a slow or unstable internet connection. NetMirror streams content from external servers, so performance depends on your connection speed and the server load. Try switching to a different server, connecting to Wi-Fi instead of mobile data, or lowering the playback quality. A minimum connection speed of 5 Mbps is recommended for smooth playback.',
      },
      {
        question: 'Can I download videos for offline viewing?',
        answer:
          'NetMirror is a content discovery platform that aggregates streaming availability information. Download and offline viewing features depend on the specific content source and server. Some servers may support this feature while others do not. Availability may vary by title and region.',
      },
      {
        question: 'Why does the player say "Server Error" or "Not Available"?',
        answer:
          'Server errors occur when the content source is temporarily down or the specific link has expired. Content availability changes frequently as sources update their libraries. Try switching to a different server using the server selector in the player. If all servers show errors for a particular title, the content may have been recently removed from those sources.',
      },
      {
        question: 'Does NetMirror support Chromecast or casting to TV?',
        answer:
          'Casting support depends on the video player and server being used. Some embedded players support Chromecast natively, while others may not. For the best casting experience, try different servers until you find one that supports your preferred casting method. You can also use Android screen mirroring as an alternative.',
      },
    ],
    disclaimerLabel: 'Disclaimer:',
    disclaimer:
      'NetMirror is a content discovery platform. Video availability may vary by region and is subject to change. NetMirror does not host or distribute video content. All trademarks belong to their respective owners. For support, contact',
  },

  appDownload: {
    breadcrumb: 'Download',
    breadcrumbParent: 'App',
    seoTitle: 'Download NetMirror APK v2.0.10 for Android',
    seoDescription:
      'Download NetMirror APK v2.0.10 for Android. Choose Universal, ARM64 or ARM32. Safe direct download with installation guide.',
    h1Prefix: 'Download',
    h1Highlight: 'NetMirror APK',
    intro:
      'NetMirror is a content discovery platform for Android that helps you find movies, TV shows, and anime across multiple streaming services in one place. Download the latest version below and install it on your Android device in under two minutes.',
    sections: [
      {
        heading: 'Available Downloads',
        blocks: [
          {
            t: 'downloads',
            items: [
              {
                title: 'Universal APK',
                meta: 'Version 2.0.10 · ~25 MB · Works on all devices',
                text: 'Recommended for most users. Contains support for all CPU architectures.',
                button: 'Download Universal',
                variant: 'universal',
              },
              {
                title: 'ARM64 (64-bit)',
                meta: 'Version 2.0.10 · ~15 MB · Modern devices',
                text: 'Smaller file for devices with 64-bit processors (most phones from 2017 onward).',
                button: 'Download ARM64',
                variant: 'arm64',
              },
              {
                title: 'ARM32 (32-bit)',
                meta: 'Version 2.0.10 · ~13 MB · Older devices',
                text: 'For older Android devices with 32-bit processors.',
                button: 'Download ARM32',
                variant: 'arm32',
              },
            ],
          },
        ],
      },
      {
        heading: 'Which Version Should You Choose?',
        blocks: [
          {
            t: 'prose',
            paragraphs: [
              'If you are not sure which version to download, the **Universal APK** is the safest choice. It includes support for all processor architectures and will work on any Android device running Android 6.0 or higher.',
              'For users who want a smaller download, you can check your device\'s processor type by going to **Settings > About Phone > Processor** on your Android device. If you see terms like "arm64-v8a" or "aarch64," download the ARM64 version. If you see "armeabi-v7a" or "armv7," use the ARM32 version.',
            ],
          },
          {
            t: 'labelList',
            title: 'Quick Guide',
            items: [
              {
                label: 'Universal:',
                text: 'Any Android phone or tablet. Best if you are unsure about your device specs.',
              },
              {
                label: 'ARM64:',
                text: 'Samsung Galaxy S8 and newer, Google Pixel, OnePlus 5 and newer, most phones from 2017+.',
              },
              {
                label: 'ARM32:',
                text: 'Older devices like Samsung Galaxy S5, Moto G (1st-3rd gen), budget phones before 2017.',
              },
            ],
          },
        ],
      },
      {
        heading: 'How to Install NetMirror APK',
        blocks: [
          {
            t: 'steps',
            steps: [
              {
                title: 'Download the APK',
                text: 'Tap the download button above for your preferred version. The file will begin downloading to your device.',
              },
              {
                title: 'Enable Unknown Sources',
                text: 'Go to **Settings > Security > Install unknown apps** and enable permission for your browser or file manager. On Android 8+, you will be prompted automatically.',
              },
              {
                title: 'Open the APK File',
                text: 'Tap the downloaded file from your notification bar, or find it in your Downloads folder using a file manager.',
              },
              {
                title: 'Tap Install',
                text: 'Android will show a confirmation dialog. Tap "Install" and wait for the process to complete. This usually takes less than 30 seconds.',
              },
              {
                title: 'Open NetMirror',
                text: 'Tap "Open" when the installation finishes, or find NetMirror in your app drawer. You are ready to start discovering content.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Having Installation Issues?',
        blocks: [
          {
            t: 'linkCards',
            cards: [
              {
                title: 'App Not Installed Error',
                text: 'Fix the most common installation error on Android devices.',
                href: '/help/app-not-installed/',
              },
              {
                title: 'Parsing Package Error',
                text: 'Resolve "problem parsing the package" when installing the APK.',
                href: '/help/parsing-package-error/',
              },
            ],
          },
        ],
      },
      {
        heading: 'Related Resources',
        blocks: [
          {
            t: 'linkList',
            links: [
              { label: 'Fix "App Not Installed" error', href: '/help/app-not-installed/' },
              { label: 'Fix parsing package error', href: '/help/parsing-package-error/' },
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        question: 'Is the NetMirror APK safe to install?',
        answer:
          'Yes. The NetMirror APK is distributed directly from our official website and CDN. We do not bundle any adware, malware, or tracking software. You can verify the file integrity by checking the file size against the values listed on this page before installing.',
      },
      {
        question: 'Do I need to uninstall the old version before updating?',
        answer:
          'In most cases, no. You can install the new APK directly over the existing version and your data will be preserved. If you encounter an "App Not Installed" error during the update, uninstall the old version first, then install the new APK.',
      },
      {
        question: 'Which APK version should I download?',
        answer:
          'If you are unsure about your device architecture, download the Universal version. It works on all Android devices. If you want a smaller file, check your device processor type in Settings > About Phone and choose ARM64 for newer devices or ARM32 for older ones.',
      },
      {
        question: 'Why does Android show a security warning during installation?',
        answer:
          'Android displays a warning for any APK installed outside of the Google Play Store. This is a standard security measure. You need to enable "Install from unknown sources" for your browser or file manager to proceed with the installation.',
      },
      {
        question: 'What Android version do I need to run NetMirror?',
        answer:
          'NetMirror requires Android 6.0 (Marshmallow) or higher. Most devices manufactured after 2016 meet this requirement. For the best experience, we recommend Android 10 or newer.',
      },
    ],
    disclaimerLabel: 'Disclaimer:',
    disclaimer:
      'NetMirror is a content discovery platform. It does not host, store, or distribute copyrighted content. All streaming availability information is for reference only. Android is a trademark of Google LLC. For support, contact',
  },
};

export default en;
