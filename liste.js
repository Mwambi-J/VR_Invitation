
 // Votre configuration Firebase
 const firebaseConfig = {
    apiKey: "AIzaSyCoUgTF0BKnoZwH77H-LmbFWRq_m4S0QrE",
    authDomain: "virtual-invitation-aa712.firebaseapp.com",
    projectId: "virtual-invitation-aa712",
    storageBucket: "virtual-invitation-aa712.appspot.com",
    messagingSenderId: "79063349854",
    appId: "1:79063349854:web:98f56062c49e6133e712cf",
    measurementId: "G-ZPVNDYRPGK"
};


// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Référence à la base de données Firebase
var database = firebase.database();





//focntion pour créer la liste de table
function createTables() {
    //déclaration de variable
    var tableCountInput = document.getElementById('tableCount');
    var tableCount = parseInt(tableCountInput.value);
    var tablesContainer = document.getElementById('tablesContainer');
    tablesContainer.innerHTML = ''; // Supprimer le contenu précédent 
    
    //ajout de tables et des noms des invités
    for (var i = 1; i <= tableCount; i++) {
        var tableDiv = document.createElement('div');
        tableDiv.classList.add('table');

        //création d'une table
        var tableNameInput = document.createElement('input');
        tableNameInput.type = 'text';
        tableNameInput.placeholder = 'Nom de la table ' + i;
        tableNameInput.className = 'nom-Table'

        //Supprimer une table
        var removeButton = document.createElement('button');
        removeButton.textContent = 'Supprimer la table';
        removeButton.addEventListener('click', function(i) {
            tablesContainer.removeChild(tableNameInput[i]);
        });

        //ajouter un invité
        var guestNameInput = document.createElement('input');
        guestNameInput.type = 'text';
        guestNameInput.placeholder = 'Noms des invités';

        var addButton = document.createElement('button');
        addButton.textContent = 'Ajouter';
        addButton.addEventListener('click', createGuestList.bind(null, tableNameInput, guestNameInput));

        var guestList = document.createElement('ol');
        guestList.classList.add('guest-list');

        // On ajoute les elements à l'arbre DOM
        tableDiv.appendChild(tableNameInput);
        tableDiv.appendChild(removeButton);
        tableDiv.appendChild(document.createElement('br'));
        tableDiv.appendChild(guestNameInput);
        tableDiv.appendChild(addButton);
        tableDiv.appendChild(guestList);

        tablesContainer.appendChild(tableDiv);
    }
}

function createGuestList(tableNameInput, guestNameInput) {
    var tableName = tableNameInput.value;
    var guestName = guestNameInput.value;

    var tableDiv = tableNameInput.parentNode;

    var guestList = tableDiv.querySelector('.guest-list');
    if (!guestList) {
        guestList = document.createElement('ul');
        guestList.classList.add('guest-list');
        tableDiv.appendChild(guestList);
    }
    //Ajouter l'invite a la liste
    var guestListItem = document.createElement('li');
    guestListItem.textContent = guestName;

    //Supprimer l'invite
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Supprimer';
    deleteButton.addEventListener('click', function () {
        guestList.removeChild(guestListItem);
    });


    var invitationButton = document.createElement('button');
    invitationButton.textContent = 'Générer invitation';
    invitationButton.addEventListener('click', function () {
        generateInvitation(guestName);
    });

    guestListItem.appendChild(deleteButton);
    guestListItem.appendChild(invitationButton);
    guestList.appendChild(guestListItem);

    guestNameInput.value = ''; // Réinitialiser le champ de texte
}

function generateInvitation(guestName){
    var invitationPageContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Invitation ${guestName} </title>
        <script src="liste.js"></script>
        <link rel="stylesheet" href="liste.css">
    </head>
    <body>
        <div id = 'msginvitation'> 
            <div id="monMsg">
                <h1>Invitation à la fête</h1>
                <p id = 'intro'>Mr,Mdm, Mmll, couple : <span id ='name'> ${guestName} </span> ,</p>
                <p>
                    Mon épouse <strong> Iris West et Moi Barry Allen</strong>,<br>
                    sommes heureux de vous annoncer que nous allons bientot nous marier !<br>
                    Nous vous invitons à vous joindres à nous pour la célébration de notre <br>
                    cérémonie de mariage. 
                </p>
                <h2 > Veuillez noter la date et le lieu </h2>
                <p>Date : [Date de la fête]</p>
                <p> Lieu :[Lieu de l'evenement] </p>
                <p>Adresse : [Adresse de la fête]</p>
                <p>Nous espérons vous voir bientôt.</p>
                <p>Cordialement,</p>
                <p>Barry et Iris</p>
                <button onclick = "downloadInvitationAsImage()">Telecharger</button>
            </div>
        </div>
    </body>
    <script>liste.js</script>
    </html>
    `;

    var newWindow = window.open();
    newWindow.document.open();
    newWindow.document.write(invitationPageContent);
    newWindow.document.close();

    // Télécharger l'invitation en tant qu'image PNG
    downloadInvitationAsImage(newWindow, guestName);
}

function downloadInvitationAsImage(newWindow, guestName) {
    
    var invitationPage = newWindow.document.querySelector('body');
    var canvas = document.createElement('canvas');
    canvas.width = invitationPage.scrollWidth;
    canvas.height = invitationPage.scrollHeight;

    var ctx = canvas.getContext('2d');
    var data = new XMLSerializer().serializeToString(invitationPage);
    var DOMURL = window.URL || window.webkitURL || window;
    var img = new Image();
    var svg = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    var url = DOMURL.createObjectURL(svg);

    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(url);

        var imgURI = canvas.toDataURL('image/png');
        var link = document.createElement('a');
        link.download = `invitation_${guestName}.png`;
        link.href = imgURI;
        link.click();
    };

    img.src = url;
}

function saveTablesToFirebase() {
    var tablesContainer = document.getElementById('tablesContainer');
    var tables = [];

    // Parcourir chaque table et récupérer les informations
    var tableDivs = tablesContainer.querySelectorAll('.table');
    tableDivs.forEach(function (tableDiv) {
        var tableName = tableDiv.querySelector('.nom-Table').value;
        var guestList = [];

        // Récupérer la liste des invités pour cette table
        var guestItems = tableDiv.querySelectorAll('.guest-list li');
        guestItems.forEach(function (guestItem) {
            var guestName = guestItem.textContent;
            guestList.push(guestName);
        });

        tables.push({
            tableName: tableName,
            guestList: guestList
        });
    });

    // Sauvegarder les tables dans Firebase sous un noeud "tables"
    database.ref('tables').set(tables)
        .then(function () {
            alert('Les tables ont été sauvegardées avec succès sur Firebase.');
        })
        .catch(function (error) {
            console.error('Erreur lors de la sauvegarde des tables sur Firebase:', error);
        });
}

// Fonction pour charger les tables sauvegardées depuis Firebase lors du chargement de la page
function loadTablesFromFirebase() {
    var tablesContainer = document.getElementById('tablesContainer');

    // Obtenir les données des tables depuis Firebase
    database.ref('tables').once('value')
        .then(function (snapshot) {
            var tables = snapshot.val();
            if (tables) {
                tables.forEach(function (table) {
                    var tableDiv = document.createElement('div');
                    tableDiv.classList.add('table');

                    var tableNameInput = document.createElement('input');
                    tableNameInput.type = 'text';
                    tableNameInput.placeholder = 'Nom de la table';
                    tableNameInput.className = 'nom-Table';
                    tableNameInput.value = table.tableName;

                    // ... Créez le reste des éléments pour cette table, similaire à la fonction createTables() ...

                    // Ajouter les invités depuis la liste sauvegardée
                    table.guestList.forEach(function (guestName) {
                        var guestListItem = document.createElement('li');
                        guestListItem.textContent = guestName;

                        // ... Ajoutez le bouton de suppression et de génération d'invitation pour chaque invité ...
                    });

                    // ... Ajoutez le reste des éléments pour cette table, similaire à la fonction createTables() ...

                    // Ajouter la table au conteneur
                    tablesContainer.appendChild(tableDiv);
                });
            }
        })
        .catch(function (error) {
            console.error('Erreur lors du chargement des tables depuis Firebase:', error);
        });
}

// Appel de la fonction pour charger les tables depuis Firebase lors du chargement de la page
loadTablesFromFirebase();

// Ajouter un écouteur d'événement pour le bouton de sauvegarde des tables
var saveTablesButton = document.getElementById('save-tables-button');
saveTablesButton.addEventListener('click', saveTablesToFirebase);
