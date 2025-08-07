import { execSync } from 'child_process'
import fse from 'fs-extra'
import os from 'os' // Add this import
import path from 'path'

const topDir = import.meta.dirname
const isWindows = os.platform() === 'win32' // Check platform

async function postinstall() {
    const tinymcePublicPath = path.join(topDir, 'public', 'tinymce')
    const tinymceNodeModulesPath = path.join(topDir, 'node_modules', 'tinymce')

    try {
        console.log('Starting TinyMCE setup...')

        // Ensure public directory exists
        await fse.ensureDir(path.join(topDir, 'public'))

        // Use platform-specific commands
        console.log('Removing existing TinyMCE directory...')
        if (isWindows) {
            execSync(
                `if exist "${tinymcePublicPath}" rd /s /q "${tinymcePublicPath}"`,
                { stdio: 'inherit' }
            )
        } else {
            execSync(`rm -rf "${tinymcePublicPath}"`, { stdio: 'inherit' })
        }

        console.log('Creating TinyMCE directory...')
        if (isWindows) {
            execSync(`mkdir "${tinymcePublicPath}"`, { stdio: 'inherit' })
        } else {
            execSync(`mkdir -p "${tinymcePublicPath}"`, { stdio: 'inherit' })
        }

        console.log('Copying TinyMCE files...')
        if (isWindows) {
            execSync(
                `xcopy "${tinymceNodeModulesPath}" "${tinymcePublicPath}" /E /I /H /Y`,
                { stdio: 'inherit' }
            )
        } else {
            execSync(
                `cp -r "${tinymceNodeModulesPath}/." "${tinymcePublicPath}/"`,
                { stdio: 'inherit' }
            )
        }

        console.log('✓ TinyMCE setup completed successfully!')
    } catch (error) {
        console.error('✗ Error during TinyMCE setup:', error.message)

        // Fallback to fs-extra if system commands fail
        console.log('Trying fs-extra fallback...')
        try {
            await fse.remove(tinymcePublicPath)
            await new Promise((resolve) => setTimeout(resolve, 100))
            await fse.copy(tinymceNodeModulesPath, tinymcePublicPath, {
                overwrite: true,
            })
            console.log('✓ Fallback successful!')
        } catch (fallbackError) {
            console.error('✗ All methods failed:', fallbackError.message)
            process.exit(1)
        }
    }
}

postinstall()
