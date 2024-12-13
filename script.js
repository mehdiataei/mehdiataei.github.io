async function imageExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

function setupImageModal() {
    const modal = document.getElementById('imageModal');
    if (!modal) {
        console.error('Modal element not found');
        return { openModal: () => console.error('Modal not initialized') };
    }

    const modalImage = modal.querySelector('.modal-image');
    if (!modalImage) {
        console.error('Modal image element not found');
        return { openModal: () => console.error('Modal image not found') };
    }

    const modalClose = modal.querySelector('.modal-close');
    if (!modalClose) {
        console.error('Modal close button not found');
        return { openModal: () => console.error('Modal close button not found') };
    }

    function openModal(imageSrc) {
        modal.style.display = 'flex';
        modalImage.src = imageSrc;
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }

    function closeModal() {
        modal.classList.remove('show');
        modal.style.display = 'none';
        setTimeout(() => {
            modalImage.src = '';
        }, 300);
    }

    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    modalClose.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        closeModal();
    });

    modalImage.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });

    return { openModal, closeModal };
}

function createNewsItemHTML(item) {
    let newsHTML = '<div class="news-content">';

    newsHTML += `
        <h3>${item.title}</h3>
        <div class="date">${item.date}</div>
        <p>${item.content}</p>
    `;

    if (item.links && item.links.length > 0) {
        newsHTML += '<div class="news-links">';
        item.links.forEach(link => {
            const icon = link.text.toLowerCase().includes('github') ? 'fab fa-github' :
                link.text.toLowerCase().includes('website') ? 'fas fa-globe' :
                    'fas fa-link';

            newsHTML += `
                <a href="${link.url}" target="_blank">
                    <i class="${icon}"></i>
                    ${link.text}
                </a>`;
        });
        newsHTML += '</div>';
    }

    newsHTML += '</div>';
    return newsHTML;
}

async function loadNews() {
    try {
        const response = await fetch('news.json');
        const data = await response.json();
        const newsContainer = document.getElementById('news-container');
        if (!newsContainer) {
            console.error('News container not found');
            return;
        }
        const { openModal } = setupImageModal();

        newsContainer.innerHTML = '';

        for (const item of data.news) {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';

            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = createNewsItemHTML(item);

            if (item.image) {
                const imageValid = await imageExists(item.image);
                if (imageValid) {
                    newsItem.className += ' has-image';
                    const imgElement = document.createElement('img');
                    imgElement.src = item.image;
                    imgElement.alt = item.title;
                    imgElement.className = 'news-image';

                    imgElement.addEventListener('click', function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        openModal(this.src);
                    });

                    // Add the image first
                    newsItem.appendChild(imgElement);
                }
            }

            newsItem.appendChild(contentDiv);

            newsContainer.appendChild(newsItem);
        }
    } catch (error) {
        const newsContainer = document.getElementById('news-container');
        if (newsContainer) {
            newsContainer.innerHTML = '<p>Error loading news items. Please try again later.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadNews();
});

document.addEventListener('DOMContentLoaded', () => {
    const copyEmailBtn = document.querySelector('.copy-email-btn');
    const emailText = document.querySelector('.email-text');
    const tooltip = document.querySelector('.copy-tooltip');

    if (!copyEmailBtn || !emailText || !tooltip) {
        console.error('Required elements not found');
        return;
    }

    copyEmailBtn.addEventListener('click', async () => {
        const textToCopy = emailText.textContent;

        try {
            // Try using the modern Clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                // Fallback for older browsers or non-HTTPS
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    textArea.remove();
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                    textArea.remove();
                    return;
                }
            }

            // Show tooltip
            tooltip.classList.add('show');

            // Hide tooltip after 2 seconds
            setTimeout(() => {
                tooltip.classList.remove('show');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    });
});
