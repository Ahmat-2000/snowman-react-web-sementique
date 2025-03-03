# Ajouter un joueur dans une cellule spécifique
# Cette requête insère un joueur (`CellPlayer`) dans la cellule `cell55`

# INSERT DATA { :cell55 a :CellPlayer }

# Récupérer la cellule actuelle où se trouve le joueur
# Utile pour savoir où est placé le joueur avant un déplacement

# SELECT ?c WHERE { ?c a :CellPlayer }

# Supprimer un joueur d’une cellule spécifique
# Ici, on retire le joueur de `cell56` s'il s'y trouve

# DELETE DATA { :cell56 a :CellPlayer }

# Déplacement du joueur vers une cellule adjacente
# Cette requête supprime l'ancien emplacement du joueur
# et le déplace vers une nouvelle cellule au nord

# DELETE { 
#     ?oldCellPlayer a :CellPlayer .
# }
# INSERT {
#     ?newCellPlayer a :CellPlayer .
# }
# WHERE {
#     ?oldCellPlayer a :CellPlayer .
#     ?oldCellPlayer :hasNorth ?newCellPlayer 
# }

# Récupérer l’état actuel du jeu
# Retourne la position du joueur, ses directions accessibles,
# et la présence des différents bonhommes de neige.

# SELECT ?player ?north ?south ?east ?west ?littleSnowman ?mediumSnowman ?bigSnowman
# WHERE {
#     ?player a :CellPlayer. # Trouver la cellule où est le joueur
#     OPTIONAL { ?player :hasNorth ?north . } # Vérifier s'il peut aller au nord
#     OPTIONAL { ?player :hasSouth ?south . } # Vérifier s'il peut aller au sud
#     OPTIONAL { ?player :hasEast ?east . }   # Vérifier s'il peut aller à l'est
#     OPTIONAL { ?player :hasWest ?west . }   # Vérifier s'il peut aller à l'ouest
#     OPTIONAL { ?littleSnowman :hasSnowman :littleSnowman. } # Vérifier où est le petit bonhomme de neige
#     OPTIONAL { ?mediumSnowman :hasSnowman :mediumSnowman. } # Vérifier où est le moyen bonhomme de neige
#     OPTIONAL { ?bigSnowman :hasSnowman :bigSnowman. }       # Vérifier où est le grand bonhomme de neige
# }

# Réinitialiser le jeu en supprimant toutes les données pertinentes
# Supprime toutes les instances de joueur (`CellPlayer`) et les bonhommes de neige existants.

# DELETE WHERE { 
#   ?player a :CellPlayer .
#   ?cell :hasSnowman ?snowman .
# }

# Réinsérer les éléments initiaux du jeu
# Replace le joueur dans `cell55` et repositionne les bonhommes de neige.

# INSERT DATA {
#   :cell55 a :CellPlayer .
#   :cell22 :hasSnowman :littleSnowman .
#   :cell88 :hasSnowman :mediumSnowman .
#   :cell82 :hasSnowman :bigSnowman .
# }

# Récupérer toutes les cellules qui sont accessibles vers le nord
# Cette requête liste toutes les cellules qui permettent un déplacement vers le nord

# SELECT * WHERE { ?c a :MovableToNorth }
