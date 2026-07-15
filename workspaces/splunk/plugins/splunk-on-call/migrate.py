#!/usr/bin/env python3
import re
import sys

# Migration mapping for imports
MUI_TO_BUI_IMPORTS = {
    r"import\s+List\s+from\s+'@material-ui/core/List';\n": "import { Box } from '@backstage/ui';\n",
    r"import\s+ListSubheader\s+from\s+'@material-ui/core/ListSubheader';\n": "",
    r"import\s+\{\s*createStyles,\s*makeStyles,\s*Theme\s*\}\s+from\s+'@material-ui/core/styles';\n": "",
    r"import\s+\{\s*ListItem,\s*ListItemIcon,\s*ListItemSecondaryAction,\s*ListItemText,\s*Tooltip,\s*IconButton,\s*Avatar,\s*Typography,\s*\}\s+from\s+'@material-ui/core';\n": "import { Box, Flex, Text, ButtonIcon, Avatar, Tooltip, TooltipTrigger } from '@backstage/ui';\n",
    r"import\s+\{\s*ListItem,\s*ListItemIcon,\s*ListItemText,\s*\}\s+from\s+'@material-ui/core';\n": "import { Box, Flex, Text } from '@backstage/ui';\n",
    r"import\s+EmailIcon\s+from\s+'@material-ui/icons/Email';\n": "import { RiMailLine } from '@remixicon/react';\n",
    r"import\s+\{\s*makeStyles\s*\}\s+from\s+'@material-ui/core/styles';\n": "",
    r"import\s+\{\s*Grid,\s*Typography\s*\}\s+from\s+'@material-ui/core';\n": "import { Flex, Text } from '@backstage/ui';\n",
    r"import\s+Typography\s+from\s+'@material-ui/core/Typography';\n": "import { Text } from '@backstage/ui';\n",
    r"import\s+Alert\s+from\s+'@material-ui/lab/Alert';\n": "",
    r"import\s+\{\s*Dialog,\s*DialogTitle,\s*DialogContent,\s*DialogActions,\s*TextField,\s*Button,\s*Typography,\s*CircularProgress,\s*Select,\s*MenuItem,\s*FormControl,\s*InputLabel,\s*\}\s+from\s+'@material-ui/core';\n": "import { Dialog, DialogTrigger, DialogHeader, DialogBody, DialogFooter, TextField, Button, Text, Skeleton, Select, MenuItem, FormControl } from '@backstage/ui';\n",
    r"import\s+Button\s+from\s+'@material-ui/core/Button';\n": "import { Button } from '@backstage/ui';\n",
    r"import\s+\{\s*DoneIcon,\s*DoneAllIcon,\s*OpenInBrowserIcon\s*\}\s+from\s+'@material-ui/icons';\n": "import { RiCheckLine, RiCheckDoubleLine, RiExternalLinkLine } from '@remixicon/react';\n",
    r"import\s+Divider\s+from\s+'@material-ui/core/Divider';\n": "",
    r"import\s+CardContent\s+from\s+'@material-ui/core/CardContent';\n": "import { CardBody } from '@backstage/ui';\n",
}

def migrate_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Replace imports
    for pattern, replacement in MUI_TO_BUI_IMPORTS.items():
        content = re.sub(pattern, replacement, content)
    
    # Remove makeStyles hooks
    content = re.sub(
        r"const\s+useStyles\s*=\s*makeStyles\s*\([^)]*\)\s*\([^)]*\)\s*\(\{[^}]*\}\);",
        "",
        content,
        flags=re.DOTALL
    )
    
    # Replace component usage patterns
    replacements = [
        (r"<Card\s+key=\{[^}]+\}\s+className=\{classes\.onCallCard\}", '<Card className={styles.onCallCard}'),
        (r"<Divider\s*/>", '<hr style={{ borderColor: "var(--bui-border-1)" }} />'),
        (r"<CardContent>", '<CardBody>'),
        (r"</CardContent>", '</CardBody>'),
        (r"<Typography\s+key=\"[^\"]*\">(.*?)</Typography>", r'<Text key="\g<1>">\g<1></Text>'),
        (r"className=\{classes\.root\}", 'className={styles.root}'),
        (r"className=\{classes\.subheader\}", 'className={styles.subheader}'),
        (r"className=\{classes\.progress\}", 'style={{ margin: "var(--bui-space-4)" }}'),
        (r"<AlarmAddIcon\s*/>", '<RiAlarmAddLine />'),
        (r"<WebIcon\s*/>", '<RiGlobalLine />'),
        (r"<EmailIcon\s*/>", '<RiMailLine />'),
        (r"<DoneIcon\s*/>", '<RiCheckLine />'),
        (r"<DoneAllIcon\s*/>", '<RiCheckDoubleLine />'),
        (r"<OpenInBrowserIcon\s*/>", '<RiExternalLinkLine />'),
    ]
    
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
        if migrate_file(filepath):
            print(f"Migrated: {filepath}")
        else:
            print(f"No changes: {filepath}")
    else:
        print("Usage: python3 migrate.py <filepath>")
