/* globals Chart:false */

(() => {
  'use strict'

  const editUserModal = document.getElementById('editUserModal')
  if (editUserModal) {
    editUserModal.addEventListener('show.bs.modal', event => {
      const button = event.relatedTarget
      document.getElementById('editUserForm').action = `/users/${button.dataset.userId}/edit`
      document.getElementById('editUserName').value = button.dataset.userName
      document.getElementById('editUserEmail').value = button.dataset.userEmail
    })
  }

  // Graphs
  const ctx = document.getElementById('myChart')
  if (ctx && window.Chart) new Chart(ctx, {
    type: 'line',
    data: {
      labels: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      datasets: [{
        data: [
          15339,
          21345,
          18483,
          24003,
          23489,
          24092,
          12034
        ],
        lineTension: 0,
        backgroundColor: 'transparent',
        borderColor: '#007bff',
        borderWidth: 4,
        pointBackgroundColor: '#007bff'
      }]
    },
    options: {
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          boxPadding: 3
        }
      }
    }
  })
})()
