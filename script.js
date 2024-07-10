document.addEventListener('DOMContentLoaded', () => {
    let jobsData = []; 
    let selectedFilters = { languages: [], tools: [] }; 

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            jobsData = data; 
            renderJobListings(data);
            setupFilters();
        })
        .catch(error => console.error('Error fetching the JSON data:', error));

    function renderJobListings(jobs) {
        const jobListingsContainer = document.getElementById('job-listings');
        jobListingsContainer.innerHTML = '';

        jobs.forEach(job => {
            const jobElement = createJobElement(job);
            jobListingsContainer.appendChild(jobElement);
        });

        
        const tags = document.querySelectorAll('.tag');
        tags.forEach(tag => {
            tag.addEventListener('click', handleTagClick);
        });
    }

    function createJobElement(job) {
        const jobElement = document.createElement('div');
        jobElement.classList.add('job-item');
        jobElement.innerHTML = `
            <div class="job-header">
                <img src="${job.logo}" class="logo">
                <div>
                    <p>${job.company} 
                        ${job.new ? '<span class="new">NEW!</span>' : ''}
                        ${job.featured ? '<span class="featured">FEATURED</span>' : ''}
                    </p>
                    <h4>${job.position}</h4>
                    <div class="job-details">
                        <p>${job.postedAt} • ${job.contract} • ${job.location}</p>
                    </div>
                </div>
           
            <div class="job-tags">
                ${job.languages.map(language => `<span class="tag">${language}</span>`).join('')}
                ${job.tools.map(tool => `<span class="tag">${tool}</span>`).join('')}
            </div>
             </div>
        `;
        return jobElement;
    }

    function setupFilters() {
        const searchBar = document.getElementById('search-bar');
        const clearButton = document.getElementById('clear-search');

        searchBar.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                addFilter(searchBar.value);
                searchBar.value = '';
            }
        });

        clearButton.addEventListener('click', () => {
            selectedFilters = { languages: [], tools: [] };
            document.getElementById('filters').classList.remove('active');
            renderSelectedFilters();
            renderJobListings(jobsData);
        });
    }

    function handleTagClick(event) {
        addFilter(event.target.innerText);
    }

    function addFilter(filter) {
        filter = filter.toLowerCase();
        const isLanguage = jobsData.some(job => job.languages.map(l => l.toLowerCase()).includes(filter));
        const isTool = jobsData.some(job => job.tools.map(t => t.toLowerCase()).includes(filter));

        if (isLanguage && !selectedFilters.languages.includes(filter)) {
            selectedFilters.languages.push(filter);
        } else if (isTool && !selectedFilters.tools.includes(filter)) {
            selectedFilters.tools.push(filter);
        }

        document.getElementById('filters').classList.add('active');
        renderSelectedFilters();
        applyFilters();
    }

    function renderSelectedFilters() {
        const selectedFiltersContainer = document.querySelector('.selected-filters');
        selectedFiltersContainer.innerHTML = '';

        [...selectedFilters.languages, ...selectedFilters.tools].forEach(filter => {
            const filterChip = document.createElement('span');
            filterChip.classList.add('filter-chip');
            filterChip.innerHTML = `${filter} <span class="close-btn">&times;</span>`;
            filterChip.querySelector('.close-btn').addEventListener('click', () => removeFilter(filter));
            selectedFiltersContainer.appendChild(filterChip);
        });
    }

    function removeFilter(filter) {
        selectedFilters.languages = selectedFilters.languages.filter(f => f !== filter);
        selectedFilters.tools = selectedFilters.tools.filter(f => f !== filter);

        if (selectedFilters.languages.length === 0 && selectedFilters.tools.length === 0) {
            document.getElementById('filters').classList.remove('active');
        }

        renderSelectedFilters();
        applyFilters();
    }

    function applyFilters() {
        const filteredJobs = filterJobs();
        renderJobListings(filteredJobs);
    }

    function filterJobs() {
        return jobsData.filter(job => {
            const jobLanguages = job.languages.map(l => l.toLowerCase());
            const jobTools = job.tools.map(t => t.toLowerCase());
            const matchesLanguages = selectedFilters.languages.every(filter => jobLanguages.includes(filter));
            const matchesTools = selectedFilters.tools.every(filter => jobTools.includes(filter));
            return matchesLanguages && matchesTools;
        });
    }
});
