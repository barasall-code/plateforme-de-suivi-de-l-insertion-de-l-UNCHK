import os, re

src = os.path.expanduser('~/plateforme-de-suivi-de-l-insertion-de-l-UNCHK/frontend/src')

# Remplacement emoji → JSX correct (className au lieu de class)
replacements = [
    # Navigation
    ('💼 Offres',          '<><i className="fa-solid fa-briefcase mr-1"></i> Offres</>'),
    ('📋 Candidatures',    '<><i className="fa-solid fa-file-lines mr-1"></i> Candidatures</>'),
    ('⭐ Compétences',     '<><i className="fa-solid fa-star mr-1"></i> Compétences</>'),
    ('👤 Profil',          '<><i className="fa-solid fa-user mr-1"></i> Profil</>'),
    ('💬 Messages',        '<><i className="fa-solid fa-comments mr-1"></i> Messages</>'),
    ('🏢 Mon profil',      '<><i className="fa-solid fa-building mr-1"></i> Mon profil</>'),
    # Boutons
    ('➕ Nouvelle offre',  '<><i className="fa-solid fa-plus mr-1"></i> Nouvelle offre</>'),
    ('➕ Créer offre',     '<><i className="fa-solid fa-plus mr-1"></i> Créer offre</>'),
    ('➕ Ajouter',         '<><i className="fa-solid fa-plus mr-1"></i> Ajouter</>'),
    ('📝 Modifier',        '<><i className="fa-solid fa-pen mr-1"></i> Modifier</>'),
    ('🗑️ Supprimer',      '<><i className="fa-solid fa-trash mr-1"></i> Supprimer</>'),
    ('🗑 Supprimer',       '<><i className="fa-solid fa-trash mr-1"></i> Supprimer</>'),
    ('✏️ Modifier',        '<><i className="fa-solid fa-pen mr-1"></i> Modifier</>'),
    ('✏ Modifier',         '<><i className="fa-solid fa-pen mr-1"></i> Modifier</>'),
    ('📄 Voir CV',         '<><i className="fa-solid fa-file-pdf mr-1"></i> Voir CV</>'),
    ('🔗 LinkedIn',        '<><i className="fa-brands fa-linkedin mr-1"></i> LinkedIn</>'),
    ('💬 Contacter',       '<><i className="fa-solid fa-comment-dots mr-1"></i> Contacter</>'),
    ('📤 Envoyer',         '<><i className="fa-solid fa-paper-plane mr-1"></i> Envoyer</>'),
    ('👁️ Voir profil',    '<><i className="fa-solid fa-eye mr-1"></i> Voir profil</>'),
    ('👁 Voir profil',     '<><i className="fa-solid fa-eye mr-1"></i> Voir profil</>'),
    ('📤 Exporter PDF',    '<><i className="fa-solid fa-file-pdf mr-1"></i> Exporter PDF</>'),
    ('📤 Exporter',        '<><i className="fa-solid fa-file-export mr-1"></i> Exporter</>'),
    ('← Retour',           '<><i className="fa-solid fa-arrow-left mr-1"></i> Retour</>'),
    ('↗',                  '<i className="fa-solid fa-arrow-up-right-from-square"></i>'),
    # Statuts inline (simples, sans fragment)
    ('✅',                 '<i className="fa-solid fa-circle-check text-green-600"></i>'),
    ('❌',                 '<i className="fa-solid fa-circle-xmark text-red-500"></i>'),
    ('⚠️',                '<i className="fa-solid fa-triangle-exclamation text-yellow-500"></i>'),
    ('⏳',                 '<i className="fa-solid fa-hourglass-half text-gray-400"></i>'),
    ('🔄',                 '<i className="fa-solid fa-rotate"></i>'),
    ('🔔',                 '<i className="fa-solid fa-bell"></i>'),
    # Icônes seules
    ('📊',                 '<i className="fa-solid fa-chart-bar"></i>'),
    ('📈',                 '<i className="fa-solid fa-chart-line"></i>'),
    ('🏢',                 '<i className="fa-solid fa-building"></i>'),
    ('🎓',                 '<i className="fa-solid fa-graduation-cap"></i>'),
    ('👥',                 '<i className="fa-solid fa-users"></i>'),
    ('👤',                 '<i className="fa-solid fa-user"></i>'),
    ('💼',                 '<i className="fa-solid fa-briefcase"></i>'),
    ('📋',                 '<i className="fa-solid fa-file-lines"></i>'),
    ('⭐',                 '<i className="fa-solid fa-star"></i>'),
    ('💬',                 '<i className="fa-solid fa-comments"></i>'),
    ('🔍',                 '<i className="fa-solid fa-magnifying-glass"></i>'),
    ('📝',                 '<i className="fa-solid fa-pen-to-square"></i>'),
    ('🗑️',                '<i className="fa-solid fa-trash"></i>'),
    ('🗑',                 '<i className="fa-solid fa-trash"></i>'),
    ('✏️',                '<i className="fa-solid fa-pen"></i>'),
    ('✏',                  '<i className="fa-solid fa-pen"></i>'),
    ('📄',                 '<i className="fa-solid fa-file-pdf"></i>'),
    ('🔗',                 '<i className="fa-solid fa-link"></i>'),
    ('📤',                 '<i className="fa-solid fa-paper-plane"></i>'),
    ('📥',                 '<i className="fa-solid fa-file-import"></i>'),
    ('👁️',                '<i className="fa-solid fa-eye"></i>'),
    ('👁',                 '<i className="fa-solid fa-eye"></i>'),
    ('💰',                 '<i className="fa-solid fa-money-bill-wave"></i>'),
    ('🛡',                 '<i className="fa-solid fa-shield"></i>'),
    ('⚙',                  '<i className="fa-solid fa-gear"></i>'),
    ('📱',                 '<i className="fa-solid fa-mobile"></i>'),
    ('🔒',                 '<i className="fa-solid fa-lock"></i>'),
    ('🏠',                 '<i className="fa-solid fa-house"></i>'),
    ('🌐',                 '<i className="fa-solid fa-globe"></i>'),
    ('🌍',                 '<i className="fa-solid fa-earth-africa"></i>'),
    ('🎯',                 '<i className="fa-solid fa-bullseye"></i>'),
    ('🚀',                 '<i className="fa-solid fa-rocket"></i>'),
    ('💡',                 '<i className="fa-solid fa-lightbulb"></i>'),
    ('🏆',                 '<i className="fa-solid fa-trophy"></i>'),
    ('📌',                 '<i className="fa-solid fa-thumbtack"></i>'),
    ('📭',                 '<i className="fa-solid fa-inbox"></i>'),
    ('📞',                 '<i className="fa-solid fa-phone"></i>'),
    ('✉️',                '<i className="fa-solid fa-envelope"></i>'),
    ('✉',                  '<i className="fa-solid fa-envelope"></i>'),
    ('🔑',                 '<i className="fa-solid fa-key"></i>'),
    ('📍',                 '<i className="fa-solid fa-location-dot"></i>'),
    ('📅',                 '<i className="fa-solid fa-calendar"></i>'),
    ('🏷️',               '<i className="fa-solid fa-tag"></i>'),
    ('🏷',                 '<i className="fa-solid fa-tag"></i>'),
    ('👋',                 '<i className="fa-solid fa-hand-wave"></i>'),
    ('🎓',                 '<i className="fa-solid fa-graduation-cap"></i>'),
    ('➕',                 '<i className="fa-solid fa-plus"></i>'),
]

count_files = 0
count_total = 0

for root, dirs, files in os.walk(src):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git']]
    for fname in files:
        if not fname.endswith('.tsx'):
            continue
        fpath = os.path.join(root, fname)
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        original = content
        n = 0
        for emoji, jsx in replacements:
            if emoji in content:
                content = content.replace(emoji, jsx)
                n += 1
        if content != original:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            count_files += 1
            count_total += n
            print(f'  ✅ {os.path.relpath(fpath, src)} ({n} remplacements)')

print(f'\n✅ Terminé : {count_files} fichiers — {count_total} icônes remplacées')
