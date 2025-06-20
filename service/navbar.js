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

        let dateVal = document.querySelectorAll('.dat');
        
        dateVal.forEach(date => {
  date.addEventListener('click', function() {
    // Remove selected class from all dates
    document.querySelectorAll('.dat').forEach(d => d.classList.remove('selected'));
    // Add selected class to clicked date
    this.classList.add('selected');
  });
});