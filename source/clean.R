library(dplyr)

url <- 'https://data.nasa.gov/data.json'
raw <- jsonlite::fromJSON(url)
datasets <- raw$dataset %>%
  select(description, distribution, issued, theme, keyword, landingPage, title, publisher) %>%
  mutate(type = 'Dataset') %>%
  mutate(theme = sapply(theme, paste0, collapse="; "),
         keyword = sapply(keyword, paste0, collapse="; "),
         description = trimws(description, which = "both")) %>%
  group_by(type, title) %>%
  summarise(theme = paste(theme, collapse="; "), 
            keyword = paste(keyword, collapse = "; "),
            landingPage = paste(landingPage, collapse = "; "),
            description = paste(description, collapse = "; ")) %>%
  filter(grepl("http", landingPage)) %>%
  arrange(type, description, title) %>%
  mutate(theme = strsplit(theme, '; '),
         keyword = strsplit(keyword, '; '),
         landingPage = strsplit(landingPage, '; '),
         description = strsplit(description, '; '))

themes <- raw$dataset %>%
  select(theme) %>%
  mutate(title = sapply(theme, paste0, collapse="; ")) %>%
  unique() %>%
  filter(title != '') %>%
  tidyr::separate_rows(title, sep=";\\s+") %>%
  unique() %>%
  mutate(type = 'theme')
  
keywords <- raw$dataset %>%
  select(keyword) %>%
  mutate(title = sapply(keyword, paste0, collapse="; ")) %>%
  unique() %>%
  filter(title != '') %>%
  tidyr::separate_rows(title, sep=";\\s+") %>%
  unique() %>%
  mutate(type = 'keyword')

all <- bind_rows(datasets, keywords, themes) %>%
  tibble::rownames_to_column("id")

keywords <- all %>%
  filter(type == 'keyword')
themes <- all %>%
  filter(type == 'theme')
datasets <- all %>%
  filter(type == 'Dataset')


links <- tibble(source = '', target = '')
for(i in (1:length(themes$title))) {
  for(j in (1:length(datasets$title))) {
    if(themes$title[i] %in% unlist(datasets$theme[j])) {
      links <- rbind(links, c(themes$id[i], datasets$id[j]))
    }
  }
}

for(i in (1:length(keywords$title))) {
  for(j in (1:length(datasets$title))) {
    if(themes$title[i] %in% unlist(datasets$theme[j])) {
      links <- rbind(links, c(themes$id[i], datasets$id[j]))
    }
  }
}

links <- links %>% 
  filter(source != "")
  
data <- list(all, links)
names(data) <- c("nodes", "links")

data %>% jsonlite::toJSON(pretty=TRUE) %>%
  readr::write_lines('../app/data/data.json')

# crossed <- function(dataset, item) {
#   if(item %in% unlist(dataset)) {
#     add_row(links, source = themes$id[i], target = datasets$id[j])
#   }
# }
# 
# purrr::map(purrr::cross2(themes$title[1:5], datasets$title[1:5]), unlist)
