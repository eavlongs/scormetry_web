import { execSync } from 'child_process'
import path from 'path'
import fse from 'fs-extra'

const topDir = import.meta.dirname

async function postinstall() {
    const tinymcePublicPath = path.join(topDir, 'public', 'tinymce')
    const tinymceNodeModulesPath = path.join(topDir, 'node_modules', 'tinymce')

    try {
        console.log('Starting TinyMCE setup...')

        // Ensure public directory exists
        await fse.ensureDir(path.join(topDir, 'public'))

        // Use system commands for more reliable file operations
        console.log('Removing existing TinyMCE directory...')
        execSync(`rm -rf "${tinymcePublicPath}"`, { stdio: 'inherit' })

        console.log('Creating TinyMCE directory...')
        execSync(`mkdir -p "${tinymcePublicPath}"`, { stdio: 'inherit' })

        console.log('Copying TinyMCE files...')
        // Copy the contents of the source directory into the destination directory
        execSync(
            `cp -r "${tinymceNodeModulesPath}/." "${tinymcePublicPath}/"`,
            { stdio: 'inherit' }
        )

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
