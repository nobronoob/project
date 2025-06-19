     document.addEventListener('DOMContentLoaded', function() {
 
            const buttons = document.querySelectorAll('#new');
            const overlay = document.getElementById('loginOverlay');
            

            buttons.forEach(button => {
       
                if (!button.closest('.overlay')) {
                    button.addEventListener('click', function(e) {
                    
                        e.preventDefault();
                        
                     
                        overlay.style.display = 'flex';
                        document.body.classList.add('blurred');
                    });
                }
            });
        });