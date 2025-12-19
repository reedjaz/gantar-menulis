document.addEventListener('DOMContentLoaded', () => {
    // Helper to trigger change event
    const triggerChange = (el) => {
        const event = new Event('change', { bubbles: true });
        el.dispatchEvent(event);
    };

    // Ketika checkbox diubah
    document.addEventListener('change', (e) => {
        if (e.target.matches('.checkbox input[type="checkbox"]')) {
            const checkbox = e.target;
            const isChecked = checkbox.checked;
            const isIndeterminate = checkbox.indeterminate;

            updateCheckboxClass(checkbox, isChecked, isIndeterminate);
            updateChildCheckboxes(checkbox);
            updateParentCheckboxes(checkbox);
        }
    });

    // Fungsi untuk memperbarui status checkbox anak-anak
    function updateChildCheckboxes(checkbox) {
        const isChecked = checkbox.checked;
        const li = checkbox.closest('li');
        if (!li) return;

        const childCheckboxes = li.querySelectorAll('ul input[type="checkbox"]');
        childCheckboxes.forEach(child => {
            child.checked = isChecked;
            child.indeterminate = false;
            updateCheckboxClass(child, isChecked, false);
        });
    }

    // Fungsi untuk memperbarui class checkbox
    function updateCheckboxClass(checkbox, isChecked, isIndeterminate) {
        checkbox.classList.remove('checked', 'indeterminate');

        if (isChecked) {
            checkbox.classList.add('checked');
            checkbox.checked = true;
            checkbox.indeterminate = false;
        } else if (isIndeterminate) {
            checkbox.classList.add('indeterminate');
            checkbox.checked = false;
            checkbox.indeterminate = true;
        } else {
            checkbox.checked = false;
            checkbox.indeterminate = false;
        }
    }

    // Fungsi untuk memperbarui status checkbox induk
    function updateParentCheckboxes(checkbox) {
        const ul = checkbox.closest('ul');
        if (!ul) return;

        let parentLi = ul.closest('li');

        while (parentLi) {
            // Find direct parent checkbox (closest previous sibling with class checkbox, or inside .checkbox container)
            // Structure assumed: <li> <div class="checkbox"><input></div> <ul>...</ul> </li>
            const parentCheckboxContainer = Array.from(parentLi.children).find(c => c.classList.contains('checkbox'));
            if (!parentCheckboxContainer) break;

            const parentCheckbox = parentCheckboxContainer.querySelector('input[type="checkbox"]');
            if (!parentCheckbox) break;

            // Get direct children checkboxes of this Li's UL
            const childUl = parentLi.querySelector('ul');
            if (!childUl) break;

            // We only want direct children checkboxes in the list, not nested ones deep down
            // But the original code used `find`, which implies all descendants? 
            // Original: $childCheckboxes = $parentLi.find('> ul input[type="checkbox"]'); 
            // This selector > ul input selects all inputs in the ul.

            const childCheckboxes = Array.from(childUl.querySelectorAll('input[type="checkbox"]'));

            const total = childCheckboxes.length;
            const checked = childCheckboxes.filter(c => c.checked).length;
            const indeterminate = childCheckboxes.filter(c => c.indeterminate).length;

            updateCheckboxClass(parentCheckbox, false, false); // Reset first

            if (checked === total && total > 0) {
                updateCheckboxClass(parentCheckbox, true, false);
            } else if (checked === 0 && indeterminate === 0) {
                updateCheckboxClass(parentCheckbox, false, false);
            } else {
                updateCheckboxClass(parentCheckbox, false, true);
            }

            // Go up one level
            const parentUl = parentLi.closest('ul');
            if (!parentUl) break;
            parentLi = parentUl.closest('li');
        }
    }

    // Inisialisasi status awal
    document.querySelectorAll('.checkbox input[type="checkbox"]').forEach(checkbox => {
        updateParentCheckboxes(checkbox);
    });
});
